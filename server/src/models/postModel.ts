import mongoose from 'mongoose';

export const postSchema = new mongoose.Schema(
  {
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserModel',
      required: true,
    },
    text: {
      type: String,
      maxLength: 500,
    },
    img: {
      type: String,
    },
    likes: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserModel' }],
      default: [],
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true, versionKey: false },
    toJSON: { virtuals: true, versionKey: false },
  },
);

export const PostModel = mongoose.model('Post', postSchema);
