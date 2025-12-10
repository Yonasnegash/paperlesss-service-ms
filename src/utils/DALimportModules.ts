import { IConfiguration } from "../config/types/configuration";
import { IService } from "../config/types/service";
import { ICategory } from "../config/types/service_category";
import { MongooseBaseRepository } from "../dal/mongooseBaseRepository.dal";
import Configuration from "../models/configuration.model";
import Service from "../models/service.model";
import ServiceCategory from "../models/service_category.model";

export const serviceRepositoryDal = new MongooseBaseRepository<IService>(Service);
export const configurationRepositoryDal = new MongooseBaseRepository<IConfiguration>(Configuration);
export const serviceCategoryRepositoryDal = new MongooseBaseRepository<ICategory>(ServiceCategory)