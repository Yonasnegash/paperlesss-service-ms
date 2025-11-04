import crypto from 'crypto'
import initConfig from '../config'
import { TopLevelConfig } from '../config/types/config'

const ALGORITHM = "aes-256-cbc"
const IV_LENGTH = 16

let _CONFIG: TopLevelConfig
let SECRET_KEY: string

const initializeConfig = async () => {
    if (!_CONFIG) {
        _CONFIG = await initConfig()
        SECRET_KEY = _CONFIG.PAPERLESS_CREDENTIAL_SECRET_KEY
        if (!SECRET_KEY || SECRET_KEY.length !== 64) {
            throw new Error("credential secret key must be 64 characters long.")
        }
    }
}

/**
 * Encrypt plain text with AES-256-CBC
 */
export const encryptText = async (text: string): Promise<string> => {
    await initializeConfig()
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(SECRET_KEY, "hex"), iv)
    let encrypted = cipher.update(text, "utf8", "hex")
    encrypted += cipher.final("hex")
    return `${iv.toString("hex")}:${encrypted}`
}

/**
 * Decrypt AES-256-CBC encrypted text
 */
export const decryptText = async (encryptedText: string): Promise<string> => {
    await initializeConfig()
    const [ivHex, encryptedHex] = encryptedText.split(":")
    const iv = Buffer.from(ivHex, "hex")
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(SECRET_KEY, "hex"), iv)
    let decrypted = decipher.update(encryptedHex, "hex", "utf8")
    decrypted += decipher.final("utf8")
    return decrypted
}