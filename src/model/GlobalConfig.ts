import mongoose, { Schema, Document } from "mongoose";

interface IGlobalConfig extends Document {
  user: mongoose.Types.ObjectId; // reference to the User
  currencyPreference?: string;
  notificationPreferences?: {
    email: boolean;
    sms: boolean;
  };
  // Add other config fields as needed
}

const userConfigSchema = new Schema<IGlobalConfig>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    currencyPreference: { type: String, default: "USD" },
    notificationPreferences: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
    },
  },
  { timestamps: true },
);

export const UserConfig = mongoose.model<IGlobalConfig>(
  "UserConfig",
  userConfigSchema,
);
