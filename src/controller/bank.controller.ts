import { Request, Response } from "express";
import bankDal from "../dal/bank.dal";
import { BankFilter } from "../config/types/bank";
import { ResponseHandler } from "../utils/response-handler";
import { type PopulateOptions } from "mongoose";
import { bankRepositoryDal } from "../utils/DALimportModules";

const whitelist = {};

const population: PopulateOptions[] = [];

const healthCheck = async (req: Request, res: Response) => {
  return res
    .status(200)
    .json({ status: 200, message: "server is up and running " });
};

const buildFilter = (params: Record<string, any>): BankFilter => {
    let filter: BankFilter = { isDeleted: false }

    return filter
}

const fetchBanksList = async (req: Request, res: Response) => {
  try {
    const query: BankFilter = buildFilter(req.query)
    const options = {
      sort: { _id: 1 },
      select: whitelist,
      populate: population
    }

    const banks = await bankRepositoryDal.find(
      query,
      options.select,
      undefined,
      population,
      true
    )

    return ResponseHandler.sendSuccess(res, "Success", banks)
    
  } catch (error) {
    return ResponseHandler.serverError(res, (error as Error)?.message || "Internal server error")
  }
};

export default {
  healthCheck,
  fetchBanksList,
};
