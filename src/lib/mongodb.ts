// lib/mongodb.ts
import mongoose from "mongoose";

let isConnected = false;

export async function connectToDatabase() {
  if (isConnected) return;
  const uri =
    (process.env.MONGODB_URI as string) ||
    "mongodb://root:example@localhost:27017/local?authSource=admin";

  if (!uri) {
    throw new Error("MONGODB_URI not set");
  }
  console.log("mongo uri:", uri);
  try {
    await mongoose.connect(uri, {
      // Make sure to add necessary options if needed
      // For example:
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });
    isConnected = true;
    console.log("Connected to MongoDB");
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error connecting to MongoDB:", error.message);
      isConnected = true;
    }
    throw new Error("Failed to connect to MongoDB");
  }
}
