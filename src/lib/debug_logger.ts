import colors from "colors";
const debugging_logger = (...messages: any) => {
  const env = process.env.NODE_ENV;
  const isDebugEnabled = process.env.ENABLE_DEBUG_LOGS == "true";
  const timestamp = new Date().toISOString();
  if ((env == "dev" || env == "uat") && isDebugEnabled) {
    // console.log(...messages);
    console.debug(colors.green(`[${timestamp}] ==> `), ...messages);
  }
};

export const debugging_logger_v2 = (messages: any[], type?: string) => {
  const env = process.env.NODE_ENV;
  const isDebugEnabled = process.env.ENABLE_DEBUG_LOGS == "true";
  const timestamp = new Date().toISOString();
  if (
    (env === "dev" || env === "uat") &&
    isDebugEnabled &&
    messages.length > 0
  ) {
    // console.log(...messages);
    const logType = type?.toLowerCase();
    if (logType == "info") {
      console.log(colors.yellow(`[${timestamp}] ✅ ==> `), ...messages);
    } else if (logType == "error") {
      console.error(colors.red(`[${timestamp}] ❌==> `), ...messages);
    } else {
      console.debug(colors.green(`[${timestamp}] ✅ ==> `), ...messages);
    }
  }
};
export default debugging_logger;
