import mongoose from "mongoose";
import { PaperlessService } from "../models/service.model";
import { PaperlessSubService } from "../models/sub_service.model";

const RESET_DB = false

const SERVICE_DATA: any[] = [
    {
        title: "Deposit Cash",
        number: 1
    },
    {
        title: "Cash Withdrawal",
        number: 2
    },
    {
        title: "Account Service",
        number: 3
    },
    {
        title: "Send to Dashen",
        number: 4
    },
    {
        title: "Transfers",
        number: 5
    },
    {
        title: "Bill Payment",
        number: 6
    },
    {
        title: "ATM Cards",
        number: 7
    },
    {
        title: "Cheque Service",
        number: 8
    },
    {
        title: "More Service",
        number: 9
    },
]

const SUB_SERVICE_DATA: any[] = [
    {
        action_menu_id: "",
        title: "Send to Dashen",
        number: 1
    },
    {
        action_menu_id: "",
        title: "Send to Other Bank",
        number: 2
    },
    {
        action_menu_id: "",
        title: "Send to Telebirr",
        number: 3
    },
    {
        action_menu_id: "",
        title: "Send to M-Pesa",
        number: 4
    },
]

const ACCOUNT_SERVICE_SUB_SERVICE_DATA: any[] = [
    {
        title: "Activate SuperApp",
        number: 1,
    },
    {
        title: "Add additional account",
        number: 2,
    },
    {
        title: "Change phone number",
        number: 3,
    },
    {
        title: "Detach Phone Number",
        number: 4,
    },
    {
        title: "USSD access request",
        number: 5,
    },
    {
        title: "Link Account",
        number: 6,
    },
    {
        title: "Balance Check",
        number: 7,
    },
    {
        title: "Unlink Account",
        number: 8,
    },
    {
        title: "Upgrade Account",
        number: 9,
    },
]

const CHEQUE_SUB_SERVICE_DATA :any[] = [
    {
        title: "Cheque Payment",
        number: 1,
    },
    {
        title: "Cheque Request",
        number: 2,
    },
    {
        title: "Cheque Confirmation",
        number: 3,
    },
    {
        title: "Stop Cheque",
        number: 4,
    }
]

const ATM_CARD_SUB_SERVICE_DATA :any = [
    {
        title: "Order ATM Card",
        number: 1,
    },
    {
        title: "Replace ATM Card",
        number: 2
    }
]

const MORE_SERVICE_SUB_SERVICE_DATA :any = [
    {
        title: "Bank Statement",
        number: 1
    },
    {
        title: "Exchange Rate",
        number: 2
    },
    {
        title: "Feedbacks",
        number: 3
    },
]

const BILL_PAYMENT_SUB_SERVICE_DATA :any = [
    {
        title: "Ethiopian Airlines",
        number: 1,
        url: "/assets/images/airline.png",
    },
    {
        title: "DSTV",
        number: 2,
        url: "/assets/images/dstv.png",
    },
    {
        title: "School Fee",
        number: 3,
        url: "/assets/images/school-fee.png",
    },
    {
        title: "Trafic Management Authority",
        number: 4,
        url: "/assets/images/trafic-mangement.png",
    },
]

const seedSubServices = async (serviceTitle: string, subServices: any[], replace: boolean = false): Promise<void> => {
    const parentService = await PaperlessService.findOne({ title: serviceTitle })

    if (!parentService) {
        return
    }

    if (replace) {
        await PaperlessSubService.deleteMany({ service_id: parentService._id })
    }

    for (const sub of subServices) {
        const existingSub = await PaperlessSubService.findOne({
            service_id: parentService._id,
            number: sub.number
        })

        if (!existingSub) {
            await PaperlessSubService.create({
            ...sub,
            service_id: parentService._id,
        });
        } else {
            let shouldUpdate = false
            for (const key in sub) {
                if ((existingSub as any)[key] !== sub[key as keyof typeof sub]) {
                    (existingSub as any)[key] = sub[key as keyof typeof sub]
                    shouldUpdate = true
                }
            }
            if (shouldUpdate) await existingSub.save()
        }
    }
}

export const seedServices = async (): Promise<void> => {
    if (SERVICE_DATA.length === 0) {
        return
    }
    for (const service of SERVICE_DATA) {
        const titleExists = await PaperlessService.findOne({ title: service.title })
        const numberExists = await PaperlessService.findOne({ number: service.number })

        if (titleExists && titleExists.number !== service.number) {
            // console.log(`❌ Title "${service.title}" already exists with a different number.`);
            continue;
        }

        if (numberExists && numberExists.title !== service.title) {
            // console.log(`❌ Number "${service.number}" already exists for "${numberExists.title}".`);
            continue;
        }

        const existing = await PaperlessService.findOne({ number: service.number });

        if (existing) {
            let shouldUpdate = false;
            for (const key in service) {
                if ((existing as any)[key] !== service[key as keyof typeof service]) {
                    (existing as any)[key] = service[key as keyof typeof service];
                    shouldUpdate = true;
                }
            }
            if (shouldUpdate) {
                await existing.save();
                // console.log(`✅ Updated service: ${service.title}`);
            } else {
                // console.log(`⏩ No changes for: ${service.title}`);
            }
        } else {
            await PaperlessService.create(service);
            // console.log(`🆕 Created new service: ${service.title}`);
        }

    }

    await seedSubServices("Transfers", SUB_SERVICE_DATA);
    await seedSubServices("Account Service", ACCOUNT_SERVICE_SUB_SERVICE_DATA);
    await seedSubServices("Cheque Service", CHEQUE_SUB_SERVICE_DATA);
    await seedSubServices("ATM Cards", ATM_CARD_SUB_SERVICE_DATA);
    await seedSubServices("More Service", MORE_SERVICE_SUB_SERVICE_DATA);
    await seedSubServices("Bill Payment", BILL_PAYMENT_SUB_SERVICE_DATA);

}