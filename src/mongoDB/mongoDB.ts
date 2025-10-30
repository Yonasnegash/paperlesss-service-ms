import mongoose from "mongoose";

import chalk from "chalk";
import initConfig from "../config";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const connect = async () => {

  const _CONFIG = await initConfig()

  try {
    mongoose
      .connect(_CONFIG.MONGODB_URL, {} as mongoose.ConnectOptions)
      .then(() => {
        console.log(chalk.blueBright.italic("Connection Made"));
      })
      .catch((err) => {
        console.log(err, "ERROR");
      });
    // await mongoose.connect(_CONFIG._VALS.docDBCONNString, {
    //   dbName: _CONFIG._VALS.docDBNAME,
    //   ssl: true,
    //   tlsAllowInvalidCertificates: true,
    //   tlsCAFile: path.join(__dirname, "rds-combined-ca-bundle.pem"),
    // });
    // console.log("Connection Made");
  } catch (error) {
    console.error(error, "Error");
  }
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const disconnect = () => {
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (!mongoose.connection) {
    return;
  }

  void mongoose.disconnect();
};

export default {
  connect,
  disconnect,
};
