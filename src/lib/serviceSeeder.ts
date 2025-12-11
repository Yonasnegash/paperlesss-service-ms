import mongoose from "mongoose";
import ServiceCategory from "../models/service_category.model";
import Service from "../models/service.model";

const RESET_DB = false

const SERVICE_CATEGORY_DATA: any[] = [
    {
        name: "Deposit Cash",
        number: 1
    },
    {
        name: "Cash Withdrawal",
        number: 2
    },
    {
        name: "Account Service",
        number: 3
    },
    {
        name: "Send to Dashen",
        number: 4
    },
    {
        name: "Transfers",
        number: 5
    },
    {
        name: "Bill Payment",
        number: 6
    },
    {
        name: "ATM Cards",
        number: 7
    },
    {
        name: "Cheque Service",
        number: 8
    },
    {
        name: "More Service",
        number: 9
    },
]

const TRANSFER_SERVICE_DATA: any[] = [
    {
        action_menu_id: "",
        name: "Send to Dashen",
        number: 1,
        expectedResponseTime: 10,
    },
    {
        action_menu_id: "",
        name: "Send to Other Bank",
        number: 2,
        expectedResponseTime: 10
    },
    {
        action_menu_id: "",
        name: "Send to Telebirr",
        number: 3,
        expectedResponseTime: 10
    },
    {
        action_menu_id: "",
        name: "Send to M-Pesa",
        number: 4,
        expectedResponseTime: 10
    },
]

const ACCOUNT_SERVICE_DATA: any[] = [
    {
        name: "Activate SuperApp",
        number: 1,
        expectedResponseTime: 10
    },
    {
        name: "Add additional account",
        number: 2,
        expectedResponseTime: 10
    },
    {
        name: "Change phone number",
        number: 3,
        expectedResponseTime: 10
    },
    {
        name: "Detach Phone Number",
        number: 4,
        expectedResponseTime: 10
    },
    {
        name: "USSD access request",
        number: 5,
        expectedResponseTime: 10
    },
    {
        name: "Link Account",
        number: 6,
        expectedResponseTime: 10
    },
    {
        name: "Balance Check",
        number: 7,
        expectedResponseTime: 10
    },
    {
        name: "Unlink Account",
        number: 8,
        expectedResponseTime: 10
    },
    {
        name: "Upgrade Account",
        number: 9,
        expectedResponseTime: 10
    },
]

const CHEQUE_SERVICE_DATA :any[] = [
    {
        name: "Cheque Payment",
        number: 1,
        expectedResponseTime: 10
    },
    {
        name: "Cheque Request",
        number: 2,
        expectedResponseTime: 10
    },
    {
        name: "Cheque Confirmation",
        number: 3,
        expectedResponseTime: 10
    },
    {
        name: "Stop Cheque",
        number: 4,
        expectedResponseTime: 10
    }
]

const ATM_CARD_SERVICE_DATA :any = [
    {
        name: "Order ATM Card",
        number: 1,
        expectedResponseTime: 10
    },
    {
        name: "Replace ATM Card",
        number: 2,
        expectedResponseTime: 10
    }
]

const MORE_SERVICE_SERVICE_DATA :any = [
    {
        name: "Bank Statement",
        number: 1,
        expectedResponseTime: 10
    },
    {
        name: "Exchange Rate",
        number: 2,
        expectedResponseTime: 10
    },
    {
        name: "Feedbacks",
        number: 3,
        expectedResponseTime: 10
    },
]

const BILL_PAYMENT_SERVICE_DATA :any = [
    {
        name: "Ethiopian Airlines",
        number: 1,
        url: "/assets/images/airline.png",
        expectedResponseTime: 10
    },
    {
        name: "DSTV",
        number: 2,
        url: "/assets/images/dstv.png",
        expectedResponseTime: 10
    },
    {
        name: "School Fee",
        number: 3,
        url: "/assets/images/school-fee.png",
        expectedResponseTime: 10
    },
    {
        name: "Trafic Management Authority",
        number: 4,
        url: "/assets/images/trafic-mangement.png",
        expectedResponseTime: 10
    },
]

export const resetDB = async(dbName: mongoose.Model<any>) => {
    await dbName.deleteMany({})
}

const seedServices = async (serviceTitle: string, services: any[], replace: boolean = false): Promise<void> => {
    const parentService = await ServiceCategory.findOne({ name: serviceTitle })

    if (!parentService) {
        return
    }

    if (replace) {
        await Service.deleteMany({ serviceCategory: parentService._id })
    }

    for (const service of services) {
        const existingSub = await Service.findOne({
            serviceCategory: parentService._id,
            number: service.number
        })

        if (!existingSub) {
            await Service.create({
            ...service,
            serviceCategory: parentService._id,
        });
        } else {
            let shouldUpdate = false
            for (const key in service) {
                if ((existingSub as any)[key] !== service[key as keyof typeof service]) {
                    (existingSub as any)[key] = service[key as keyof typeof service]
                    shouldUpdate = true
                }
            }
            if (shouldUpdate) await existingSub.save()
        }
    }
}

export const seedServicesCategory = async (): Promise<void> => {
    if (SERVICE_CATEGORY_DATA.length === 0) {
        return
    }

    if (RESET_DB) {
        resetDB(ServiceCategory)
        resetDB(Service)
    }
    for (const service_category of SERVICE_CATEGORY_DATA) {
        const titleExists = await ServiceCategory.findOne({ name: service_category.name })
        const numberExists = await ServiceCategory.findOne({ number: service_category.number })

        if (titleExists && titleExists.number !== service_category.number) {
            // console.log(`❌ Title "${service_category.name}" already exists with a different number.`);
            continue;
        }

        if (numberExists && numberExists.name !== service_category.name) {
            // console.log(`❌ Number "${service_category.number}" already exists for "${numberExists.name}".`);
            continue;
        }

        const existing = await ServiceCategory.findOne({ number: service_category.number });

        if (existing) {
            let shouldUpdate = false;
            for (const key in service_category) {
                if ((existing as any)[key] !== service_category[key as keyof typeof service_category]) {
                    (existing as any)[key] = service_category[key as keyof typeof service_category];
                    shouldUpdate = true;
                }
            }
            if (shouldUpdate) {
                await existing.save();
                // console.log(`✅ Updated service_category: ${service_category.name}`);
            } else {
                // console.log(`⏩ No changes for: ${service_category.name}`);
            }
        } else {
            await ServiceCategory.create(service_category);
            // console.log(`🆕 Created new service_category: ${service_category.name}`);
        }

    }

    await seedServices("Transfers", TRANSFER_SERVICE_DATA);
    await seedServices("Account Service", ACCOUNT_SERVICE_DATA);
    await seedServices("Cheque Service", CHEQUE_SERVICE_DATA);
    await seedServices("ATM Cards", ATM_CARD_SERVICE_DATA);
    await seedServices("More Service", MORE_SERVICE_SERVICE_DATA);
    await seedServices("Bill Payment", BILL_PAYMENT_SERVICE_DATA);

}