import { Bank } from "../config/types/bank";
import { IConfiguration } from "../config/types/configuration";
import { ICredential } from "../config/types/credeintial";
import { IService } from "../config/types/service";
import { ICategory } from "../config/types/service_category";
import { MongooseBaseRepository } from "../dal/mongooseBaseRepository.dal";
import Configuration from "../models/configuration.model";
import Credential from "../models/credential.model";
import OtbankModel from "../models/otbank.model";
import Service from "../models/service.model";
import ServiceCategory from "../models/service_category.model";

export const serviceRepositoryDal = new MongooseBaseRepository<IService>(Service);
export const configurationRepositoryDal = new MongooseBaseRepository<IConfiguration>(Configuration);
export const serviceCategoryRepositoryDal = new MongooseBaseRepository<ICategory>(ServiceCategory)
export const credentialRepositoryDal = new MongooseBaseRepository<ICredential>(Credential)
export const bankRepositoryDal = new MongooseBaseRepository<Bank>(OtbankModel)