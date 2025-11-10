import mongoose from "mongoose"
import { ICredential } from "../config/types/credeintial"
import { Credential } from "../models/credential.model"
import { ApiError } from "../utils/ApiError"
import { decryptText } from "../utils/encryption"

const fetchCredentials = async () => {
    const credentials = await Credential.find()

    return credentials.map((credential) => ({
        _id: credential._id,
        branchName: credential.branchName || '',
        branchCode: credential.branchCode || '',
        district: credential.district || '',
        createdAt: credential.createdAt || ''
    }))
}

const generateCredential = async (data: ICredential) => {
    return await Credential.create(data)
}

const viewCredential = async (id: string | mongoose.Types.ObjectId) => {
    const credential = await Credential.findById(id)

    if (!credential) {
        throw new ApiError(400, "Credential not found")
    }

    const plainPassword = await decryptText(credential.plainPasswordEncrypted)

    return {
        username: credential.username,
        password: plainPassword
    }
}

export const credentialDal = {
    fetchCredentials,
    generateCredential,
    viewCredential
}