import { NextFunction, Request, Response } from "express"
import { credentialDal } from "../dal/credential.dal"

const getCredentials = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const configurations = await credentialDal.fetchCredentials()
        return res.status(200).json({ message: 'Success', data: configurations, status: 200 })
    } catch (error) {
        next(error)
    }
}

const generateCredential = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const credential = await credentialDal.generateCredential(req.body)
        const plainPassword = (credential as any)._plainPassword

        return res.status(201).json({ message: 'Success', status: 201, data: {
            username: credential.username,
            password: plainPassword
        }})
    } catch (error) {
        next(error)
    }
}

const viewCredential = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const credential = await credentialDal.viewCredential(req.params.id)
        
        return res.status(200).json({
            message: "Success",
            status: 200,
            data: credential
        })
    } catch (error) {
        next(error)
    }
}

export const credentialController = {
    getCredentials,
    generateCredential,
    viewCredential
}