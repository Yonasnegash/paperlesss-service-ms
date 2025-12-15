import mongoose from "mongoose";

import chalk from "chalk";
import initConfig from "../config";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const connect = async () => {

  const _CONFIG = await initConfig()

  try {
    mongoose
      .connect(_CONFIG.MONGODB_PAPERLESS_URL, {} as mongoose.ConnectOptions)
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

let superAppConnection: mongoose.Connection | null = null;

export const getSuperAppConnection = async () => {
  const _CONFIG = await initConfig();

  if (!superAppConnection) {
    superAppConnection = mongoose.createConnection(_CONFIG.SUPERAPP_MONGODB_URL);

    superAppConnection.on("connected", () => {
      console.log("SuperApp DB Connected");
    });

    superAppConnection.on("error", (err) => {
      console.error("SuperApp DB error:", err);
    });
  }

  return superAppConnection;
};

export default {
  connect,
  disconnect,
};
