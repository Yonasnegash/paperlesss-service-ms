import {
    type Document,
    type UpdateQuery,
    type FilterQuery,
    type Types,
    type ProjectionType,
    type QueryOptions
} from 'mongoose'

interface IVideo extends Document {
    title: string
    subText: string
    videoUrl: string
    thumbnailUrl: string
    type: string
    isActive: boolean
}

export type IVideo = IVideo & Document

export interface VideoFilter extends FilterQuery<IVideo> { }
export interface VideoProject extends ProjectionType<IVideo> { }
export interface VideoOptions extends QueryOptions<IVideo> { }
export interface VideoUpdate extends UpdateQuery<IVideo> { }