import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
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
    parentPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      default: null,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true, versionKey: false },
    toJSON: { virtuals: true, versionKey: false },
  },
);

export const PostModel = mongoose.model('Post', postSchema);
