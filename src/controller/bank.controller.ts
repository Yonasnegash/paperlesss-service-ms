import { Request, Response } from "express";
import bankDal from "../dal/bank.dal";

import { storeFileToMinio } from "../utils/multerMinio"; // bank image assets should be stored in minio

const healthCheck = async (req: Request, res: Response) => {
  return res
    .status(200)
    .json({ status: 200, message: "server is up and running " });
};

const fetchBanksList = async (req: Request, res: Response) => {
  const query = {
    isDeleted: false,
  };
  // const options = {
  //   select:
  // }
  const { statusCode, body } = await bankDal({ method: "get-all", query });
  if (statusCode !== 200) {
    return res.status(400).json({ message: body.error });
  }
  return res.status(200).json({ status: 200, message: "", data: body.data });
};

export default {
  healthCheck,
  fetchBanksList,
};
