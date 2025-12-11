import mongoose, {
    Document,
    Model,
    FilterQuery,
    PopulateOptions,
    ProjectionType,
    QueryOptions,
    PaginateResult,
    UpdateQuery
} from "mongoose";

export class MongooseBaseRepository<T extends Document> {
    public readonly population: PopulateOptions[]

    constructor(readonly model: Model<T>, population: PopulateOptions[] = []) {
        this.population = population
    }

    async create(data: Partial<T>): Promise<T> {
        return await this.model.create(data)
    }

    async exists(query: FilterQuery<T>): Promise<boolean> {
        const result = await this.model.exists(query)
        return !!result
    }

    async findOne(
        query: FilterQuery<T>,
        returnedFields?: ProjectionType<T>,
        options?: QueryOptions,
        population?: PopulateOptions[],
        lean: boolean = false
    ): Promise<T | null> {
        let documentQuery = this.model.findOne(query, returnedFields, options)

        if (population?.length || this.population.length) {
            documentQuery = documentQuery.populate(population?.length ? population : this.population)
        }

        if (lean) {
            documentQuery = documentQuery.lean() as any
        }

        return await documentQuery.exec()
    }

    async find(
        query: FilterQuery<T>,
        returnedFields?: ProjectionType<T>,
        options?: QueryOptions,
        population?: PopulateOptions[],
        lean: boolean = false
    ): Promise<T[] | any[]> {
        let documentQuery = this.model.find(query, returnedFields, options)

        if (population?.length || this.population.length) {
            documentQuery = documentQuery.populate(population?.length ? population : this.population)
        }

        if (lean) {
            documentQuery = documentQuery.lean() as any
        }

        return await documentQuery.exec()
    }

    async paginate(
        query: FilterQuery<T>,
        options:
            | (QueryOptions & {
                page?: number;
                limit?: number;
                populate?: PopulateOptions[]
            })
            | QueryOptions
    ): Promise<PaginateResult<T>> {
        const opts = {
            select: options?.select || {},
            sort: options?.sort || {},
            populate: options?.populate || this.population,
            lean: true,
            leanWidthId: false,
            page: options?.page || 1,
            limit: options?.limit || 10
        }
        return await (this.model as any).paginate(query, opts)
    }

    async cursorBasedPaginate(
    query: FilterQuery<T>,
    options?:
      | (QueryOptions & {
        cursor?: string;
        limit?: number;
        populate?: PopulateOptions[];
        isAggregation?: boolean;
        select?: ProjectionType<T>;
      })
      | QueryOptions
  ): Promise<{
    results: T[];
    nextCursor: string | null;
    totalDocs: number;
    totalPages: number;
  }> {
    const opts: any = {
      select: options?.select || {},
      populate: options?.populate || this.population,
      lean: true,
      leanWithId: false,
    };

    const limit = options?.limit || 10;

    if (options?.isAggregation && Array.isArray(query)) {
      return await this.cursorBasedAggregate(query, limit, options.cursor);
    }

    const finalQuery: FilterQuery<T> = {
      ...query,
      ...(options?.cursor && options.cursor !== "null" && options.cursor !== "undefined" && options.cursor !== "" ? { _id: { $gte: options.cursor } } : {}),
    };

    let results = (await this.model
      .find(finalQuery, opts.select, opts)
      .sort({ _id: 1 })
      .limit(limit + 1)
      .lean()) as T[];

    const hasNextPage = results.length > limit;
    let nextCursor: string | null = null;

    if (hasNextPage) {
      nextCursor = (results[results.length - 1] as any)._id.toString();
      results = results.slice(0, limit);
    }

    if (opts.populate) {
      results = await (this.model as any).populate(results, opts.populate);
    }

    const totalDocs = await this.model.countDocuments(query);
    const totalPages = Math.ceil(totalDocs / limit);

    return { results, nextCursor, totalDocs, totalPages };
  }

  private async cursorBasedAggregate(
    pipeline: any[],
    limit: number,
    cursor?: string
  ): Promise<{
    results: any[];
    nextCursor: string | null;
    totalDocs: number;
    totalPages: number;
  }> {
    if (cursor) {
      pipeline.push({
        $match: { _id: { $gt: new mongoose.Types.ObjectId(cursor) } },
      });
    }

    pipeline.push({ $sort: { _id: 1 } }, { $limit: limit + 1 });

    const results = await this.model.aggregate(pipeline);

    let nextCursor = null;
    let actualResults = results;

    // have we more results?
    if (results.length > limit) {
      actualResults = results.slice(0, limit);
      nextCursor = actualResults[actualResults.length - 1]._id.toString();
    }

    // separate query for total, count
    const countPipeline = pipeline.filter(
      (stage) =>
        !("$sort" in stage) && !("$limit" in stage) && !("$skip" in stage)
    );
    countPipeline.push({ $count: "total" });

    const countResult = await this.model.aggregate(countPipeline);
    const totalDocs = countResult[0]?.total || 0;
    const totalPages = Math.ceil(totalDocs / limit);

    return { results: actualResults, nextCursor, totalDocs, totalPages };
  }

  async updateOne(
    query: FilterQuery<T>,
    updates: UpdateQuery<T>,
    options: QueryOptions = { new: true },
    population?: PopulateOptions[],
  ): Promise<T | null> {
    const doc = await this.model.findOneAndUpdate(query, updates, options)
    if (!doc) return null
    if (population?.length || this.population.length) {
        return await doc.populate(
            population?.length ? population : this.population
        )
    }
    return doc
  }

  async updateMany(
    query: FilterQuery<T>,
    updates: UpdateQuery<T>,
  ): Promise<{ modifiedCount: number }> {
    const result = await this.model.updateMany(query, updates).exec()
    return { modifiedCount: result.modifiedCount }
  }

  async updateConfigurationBulk(configurations: any[]): Promise<any[]> {
    if (!Array.isArray(configurations) || configurations.length === 0) {
      return []
    }

    const ops = configurations
      .filter(c => c._id)
      .map(config => ({
        updateOne: {
          filter: { _id: config._id },
          update: { $set: { range: config.range }}
        }
      }))

    if (ops.length === 0) return []

    await this.model.bulkWrite(ops)

    const ids = configurations.map(c => c._id)
    return await this.model.find({ _id: { $in: ids }}).lean()
  }

  async deleteOne(query: FilterQuery<T>): Promise<T | null> {
    return this.model.findOneAndDelete(query)
  }

  async cursorBasedPaginateWithFlags(
    query: FilterQuery<T>,
    options: {
      cursor?: string;
      limit?: number;
      populate?: PopulateOptions[];
      select?: ProjectionType<T>;
      configModel?: Model<any>;
    }
  ): Promise<{
    results: any[];
    nextCursor: string | null;
    totalDocs: number;
    totalPages: number;
  }> {
    const limit = options?.limit || 10
    const finalQuery: FilterQuery<T> = {
      ...query,
      ...(options?.cursor && options.cursor !== "null" && options.cursor !== "undefined" && options.cursor !== "" ? { _id: { $gte: options.cursor } } : {}),
    }

    let results = (await this.model
      .find(finalQuery, options?.select || {}, {
        sort: { _id: 1 },
        limit: limit + 1,
        populate: options?.populate || this.population,
        lean: true,
        leanWithId: false,
      })
    ) as T[]
    
    const hasNextPage = results.length > limit
    let nextCursor: string | null = null

    if (hasNextPage) {
      nextCursor = (results[results.length - 1] as any)._id.toString()
      results = results.slice(0, limit)
    }

    if (options?.configModel) {
      const configs = await options.configModel.find({ isActive: true }).lean()
      const warningConfig = configs.find((c: any) => c.flagType === 'WARNING')

      results = results.map((service: any) => {
        const expectedTime = service.expectedResponseTime
        const warningStart = expectedTime * (warningConfig?.range.start || 50) / 100
        const warningEnd = expectedTime * (warningConfig?.range.end || 100) / 100

        return {
          ...service,
          criticalFlagTime: `Above ${expectedTime} Min`,
          warningFlagTime: `${Math.round(warningStart)} Min - ${Math.round(warningEnd)} Min`,
          normalFlagTime: `Below ${Math.round(warningStart)} Min`
        }
      })
    }

    const totalDocs = await this.model.countDocuments(query)
    const totalPages = Math.ceil(totalDocs / limit)

    return { results, nextCursor, totalDocs, totalPages }
  }
}