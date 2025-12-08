import { IConfiguration } from "../config/types/configuration";
import { IService } from "../config/types/service";
import { MongooseBaseRepository } from "../dal/mongooseBaseRepository.dal";
import Configuration from "../models/configuration.model";
import Service from "../models/service.model";

export const serviceRepositoryDal = new MongooseBaseRepository<IService>(Service);
export const configurationRepositoryDal = new MongooseBaseRepository<IConfiguration>(Configuration);