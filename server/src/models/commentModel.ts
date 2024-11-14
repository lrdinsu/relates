import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PostModel',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserModel',
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    profilePic: {
      type: String,
      default: null,
    },
    text: {
      type: String,
      maxLength: 280,
      required: true,
    },
    likes: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserModel' }],
      default: [],
    },
    parentCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CommentModel',
      default: null,
    },
    repliesCount: {
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

export const CommentModel = mongoose.model('Comment', commentSchema);
