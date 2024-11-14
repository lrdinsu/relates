import mongoose from 'mongoose';

export function stringToObjectId(id: string) {
  return new mongoose.Types.ObjectId(id);
}
