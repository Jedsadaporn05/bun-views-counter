import mongoose, { Schema } from "mongoose";

const schema = new Schema({
  slug: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
});

export const PageView = mongoose.model("PageView", schema);
