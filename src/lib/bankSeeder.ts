import fs from 'fs'
import path from "path";
import OtbankModel from "../models/otbank.model";

export const seedBanks = async () => {
    try {
        const filePath = path.join(__dirname, "seed/banks.json")
        const banks = JSON.parse(fs.readFileSync(filePath, "utf-8"))

        for (const bank of banks) {
            const existing = await OtbankModel.findOne({ bankCode: bank.bankCode })

            if (existing) return 

            await OtbankModel.create(bank)
        }
        console.log('\n Bank seeding completed successfully')
        process.exit(0)
    } catch (error: any) {
        console.log('Error seeding configuration', error)
        process.exit(1)
    }
}