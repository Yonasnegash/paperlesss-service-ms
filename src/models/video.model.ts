import { type PaginateModel } from "mongoose";
import moment from "moment";
import modules from './imports/index'
import { IVideo } from "../config/types/video";

const Schema = modules.mongoose.Schema

const VideoSchema = new Schema<IVideo>(
    {
        title: { type: String },
        subText: { type: String },
        isActive: { type: Boolean, default: false },
        thumbnailUrl: { type: String },
        videoUrl: { type: String },
        type: { type: String }
    },
    { timestamps: true }
)

VideoSchema.plugin(modules.paginator)

VideoSchema.pre<IVideo>(
    "save",
    function (next) {
        const now = moment().tz("Africa/Addis_Ababa").format();
        this.set({ createdAt: now, updatedAt: now });
        next();
    }
)

VideoSchema.pre<IVideo>(
  "findOneAndUpdate",
  function (next) {
    this.set({ updatedAt: moment().tz("Africa/Addis_Ababa").format() });
    next();
  }
);

const Video = modules.mongoose.model<IVideo, PaginateModel<IVideo>>(
    "Video",
    VideoSchema
)

export default Video