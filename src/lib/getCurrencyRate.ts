import axios from "axios";
import fs from "node:fs";
import path from "node:path";

export const getCurrency = async () => {
  console.log("* * * * Get Currency CRON * * * *");

  const core_url = global._CONFIG.DSTV_URL;

  const base_url = `${core_url}/fetch/available/currencies`;

  const FILE_PATH = path.join(__dirname, "..", "assets", "currencyData.json");

  try {
    const response: any = await axios.post(base_url, {}, {});

    // console.log("response", response.data);

    if (response) {
      const dataToSave = {
        data: response.data.data,
        createdAt: new Date().toISOString(),
      };

      if (!fs.existsSync(FILE_PATH)) {
        fs.writeFileSync(
          FILE_PATH,
          JSON.stringify(dataToSave, null, 2),
          "utf8"
        );
        console.log("File created and data saved");
      } else {
        const fileData = JSON.parse(fs.readFileSync(FILE_PATH, "utf8"));

        fileData.data = response.data;
        fileData.createdAt = new Date().toISOString();

        fs.writeFileSync(FILE_PATH, JSON.stringify(fileData, null, 2), "utf8");
        console.log("File updated with new data");
      }

      return { status: true, data: response?.data };
    }
    return { status: false, message: "Please try again" };
  } catch (error: any) {
    console.log("error : ", error);

    const errorMessage = error?.response?.data?.error ?? "something went wrong";
    return { status: false, error: errorMessage };
  }
};
