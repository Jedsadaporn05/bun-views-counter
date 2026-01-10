import mongoose, { Schema } from "mongoose";

const schema = new Schema({
  createAt: { type: Date, required: true, index: true },
  visitorId: { type: String, index: true },
  slug: { type: String, index: true },
  ip: String,
  os: String,
  device: String,
  resolution: String,
  browser: String,
  trafficSource: String,
  userAgent: String,
  isNewVisitor: Boolean,
});

export const UserView = mongoose.model("UserView", schema);
