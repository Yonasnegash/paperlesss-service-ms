import crypto from "crypto";

let getRandomArbitrary = () => {
  const min = 100000;
  const max = 999999;

  const generatedNumber = crypto.randomInt(min, max);
  return String(generatedNumber);
};

let formatPhoneNumber = (phoneNumber: string) => {
  if (String(phoneNumber).startsWith("0"))
    return "+251" + String(phoneNumber).substring(1);
  else if (String(phoneNumber).startsWith("9"))
    return "+251" + String(phoneNumber);
  else if (String(phoneNumber).startsWith("+")) return String(phoneNumber);
  else if (String(phoneNumber).startsWith("251"))
    return "+" + String(phoneNumber);
};

export const generate12DigitNumber = (): string => {
  const now = performance.now();

  const randomSeed = now * Math.random();
  const result = Math.floor(randomSeed).toString().slice(-12).padStart(12, "0");
  return result;
};

let localEncryptPassword = (password: string) => {
  const PWDSecretKey = global._CONFIG.PWDSecretKey;
  const PWDiv = global._CONFIG.PWDiv;

  const cipher = crypto.createCipheriv("aes-256-cbc", PWDSecretKey, PWDiv);

  let encrypted = cipher.update(password, "utf8", "hex");

  encrypted += cipher.final("hex");
  // console.log("THIS ENCRYPTED PWD: ", encrypted);

  return encrypted;
};

let localDecryptPassword = (encryptedPassword: string) => {
  const PWDSecretKey = global._CONFIG.PWDSecretKey;
  const PWDiv = global._CONFIG.PWDiv;

  const decipher = crypto.createDecipheriv("aes-256-cbc", PWDSecretKey, PWDiv);

  let decrypted = decipher.update(encryptedPassword, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};

const decrypt = (encryptedPassword: string, authtag: string) => {
  const PWDSecretKey = global._CONFIG.PWDSecretKey;
  const PWDiv = global._CONFIG.PWDiv;

  const decipher = crypto.createDecipheriv("aes-256-gcm", PWDSecretKey, PWDiv);

  // Set the auth tag explicitly
  decipher.setAuthTag(Buffer.from(authtag, "hex"));

  let decrypted = decipher.update(encryptedPassword, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};

const getcipherauth = (
  encryptedtext: string
): { auth: string; cipher: string } => {
  const parts = encryptedtext.split(".");
  if (parts.length !== 2) {
    throw new Error("Invalid format: expected 'cipher.authTag'");
  }
  return {
    cipher: parts[0],
    auth: parts[1],
  };
};

function decodeBasicAuth(authHeader: string) {
  const decoded = Buffer.from(authHeader, "utf8").toString("utf-8");
  const [username, password] = decoded.split(":");
  return { username, password };
}
function generateUniqueCode(length: number = 6): string {
  const timestamp = Date.now().toString();
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const validChars = timestamp + letters;

  let result = "";
  for (let i = 0; i < length; i++) {
    result += validChars[Math.floor(Math.random() * validChars.length)];
  }
  return result;
}

function normalizeDate(date?: string) {
  if (!date) return "all"
  return new Date(date).toISOString().split("T")[0]
}

export default {
  formatPhoneNumber,
  getRandomArbitrary,
  localEncryptPassword,
  localDecryptPassword,

  getcipherauth,
  decodeBasicAuth,
  decrypt,
  generateUniqueCode,
  normalizeDate
};
