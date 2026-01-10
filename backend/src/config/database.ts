import mongoose from "mongoose";
import Redis from "ioredis";
import { ENV } from "./env";

export const redis = new Redis(ENV.REDIS_URL);

export const connectDB = async () => {
  try {
    await mongoose.connect(ENV.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB Error:", error);
    process.exit(1);
  }
};
