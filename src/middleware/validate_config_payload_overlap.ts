import { Configuration } from "../models/configuration.model"
import { ApiError } from "../utils/ApiError"
import { IConfiguration } from "../config/types/configuration"

export const validateOverlaps = async (configurations: IConfiguration[]) => {
    const existingConfig = await Configuration.find({}).lean()

    const finalConfigs = existingConfig.map(cfg => {
        const updated = configurations.find(c => c._id.toString() === cfg._id.toString())
        return updated ? { ...cfg, range: updated.range } : cfg
    })

    finalConfigs.sort((a, b) => a.range.start - b.range.start)

    const overlaps = []
    for (let i = 0; i < finalConfigs.length - 1; i++) {
        const current = finalConfigs[i]
        const next = finalConfigs[i + 1]

        const currentEnd = current.range.end === null ? Infinity : current.range.end 
        const nextStart = next.range.start

        if (currentEnd >= nextStart) {
            overlaps.push({
                current: { id: current._id, range: current.range, flag: current.flagType },
                next: { id: next._id, range: next.range, flag: next.flagType }
            })
        }
    }

    if (overlaps.length > 0) {
        const overlapMsg = overlaps
            .map(o => `Overlap detected between ${o.current.flag} flag (${o.current.range.start}-${o.current.range.end}) and ${o.next.flag} flag (${o.next.range.start}-${o.next.range.end})`)
            .join("; ")
        throw new ApiError(400, overlapMsg)
    }

    return true
}