import { type PopulateOptions } from "mongoose";
import OtbankModel from "../models/otbank.model";
import {
  type BankUpdate,
  type IBank,
  type BankFilter,
  type BankOptions,
} from "../config/types/bank";

const whitelist = {};

const population: PopulateOptions[] = [];

interface BankDalParams {
  method:
    | "create"
    | "get"
    | "get-all"
    | "get collection"
    | "get paginate"
    | "update"
    | "delete";
  query?: BankFilter;
  options?: BankOptions;
  data?: IBank;
  update?: BankUpdate;
}

interface BankReturn {
  statusCode: number;
  body: {
    error: unknown;
    data?: IBank | Omit<IBank, "password" | "_cred"> | IBank[];
    // | PaginateResult<any>;//
  };
}

/**
 * BankDal function
 */
export async function bankDal(props: BankDalParams): Promise<BankReturn> {
  switch (props.method) {
    case "create": {
      const { data } = props;

      if (data != null) {
        return await createBank(data);
      } else {
        return {
          statusCode: 400,
          body: {
            error: "no data provided",
          },
        };
      }
    }

    case "get": {
      const { query, options } = props;

      return await getBank(query ?? {}, options);
    }

    case "get paginate": {
      const { query, options } = props;

      return await getPaginate(query ?? {}, options);
    }

    case "get-all": {
      const { query, options } = props;

      return await getBanks(query ?? {}, options);
    }

    case "update": {
      const { query, options, update } = props;

      if (query !== undefined || update !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return await updateBank(query!, update!, options);
      }
      return {
        statusCode: 400,
        body: {
          error: "query or update not provided",
        },
      };
    }

    default: {
      return {
        statusCode: 500,
        body: {
          error: "Unknown database action",
        },
      };
    }
  }
}

async function createBank(data: IBank): Promise<BankReturn> {
  try {
    const bank: any = await OtbankModel.create(data);

    return {
      statusCode: 201,
      body: {
        error: null,
        data: bank,
      },
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      body: {
        error: err.message,
      },
    };
  }
}

async function getBank(
  query: BankFilter,
  options?: BankOptions
): Promise<BankReturn> {
  try {
    const bank: any = await OtbankModel.findOne(query, whitelist ?? options)
      .lean()
      .populate(population);

    if (bank != null) {
      return {
        statusCode: 200,
        body: { error: null, data: bank },
      };
    } else {
      return {
        statusCode: 400,
        body: { error: "bank not found" },
      };
    }
  } catch (err: any) {
    return {
      statusCode: 500,
      body: {
        error: "something went wrong",
      },
    };
  }
}

async function getPaginate(
  query: BankFilter,
  options?: BankOptions
): Promise<BankReturn> {
  const opts = {
    select: whitelist,
    sort: options != null ? options.sort : {},
    populate: population,
    lean: true,
    page: options != null ? Number(options.page) : 1,
    limit: options != null ? Number(options.limit) : 10,
  };

  try {
    const paginatedBankList = await OtbankModel.paginate(query, opts);

    return {
      statusCode: 200,
      body: {
        error: null,
        data: paginatedBankList as any,
      },
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      body: {
        error: err.message,
      },
    };
  }
}

async function getBanks(
  query: BankFilter,
  options?: BankOptions
): Promise<BankReturn> {
  const opts = {
    select: whitelist,
    sort: options != null ? options.sort : {},
    populate: population,
    lean: true,
  };

  try {
    const banks = await OtbankModel.find(query)
      .select(opts.select)
      .sort(opts.sort)
      .populate(opts.populate)
      .lean();

    return {
      statusCode: 200,
      body: {
        error: null,
        data: banks as any,
      },
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      body: {
        error: err.message,
      },
    };
  }
}

async function updateBank(
  query: BankFilter,
  update: BankUpdate,
  options?: BankOptions
): Promise<BankReturn> {
  const opts = {
    new: true,
    select: whitelist,
    ...options,
  };

  try {
    const bank: any = await OtbankModel.findOneAndUpdate(query, update, opts)
      .populate(population)
      .lean();

    if (bank != null) {
      return {
        statusCode: 200,
        body: {
          error: null,
          data: bank,
        },
      };
    }
    return {
      statusCode: 400,
      body: { error: "error updating bank" },
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      body: {
        error: err.message,
      },
    };
  }
}

export default bankDal;
