import { Configuration } from "../models/configuration.model";

const seedData = [
    {
        flagType: "CRITICAL",
        range: { start: 100, end: null },
        isActive: true
    },
    {
        flagType: "WARNING",
        range: { start: 80, end: 99 },
        isActive: true
    },
    {
        flagType: "NORMAL",
        range: { start: 0, end: 79 },
        isActive: true
    },
]

export const seedConfiguration = async () => {
    try {
        for (const data of seedData) {
            const existing = await Configuration.findOne({ flagType: data.flagType })

            if (existing) return

            await Configuration.create(data)
            console.log(`Added new flag: ${data.flagType}`)
        }

        console.log('\n Configuration seeding completed successfully')
        process.exit(0)
    } catch (error) {
        console.error("Error seeding configurations:", error);
        process.exit(1)
    }
}