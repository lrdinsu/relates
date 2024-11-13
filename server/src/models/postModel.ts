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
      type: Number,
      default: 0,
    },
    replies: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          res: 'UserModel',
          required: true,
        },
        text: {
          type: String,
          maxLength: 280,
          required: true,
        },
        useProfilePic: {
          type: String,
        },
        username: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

export const PostModel = mongoose.model('Post', postSchema);
