import { Document, Schema } from "mongoose";
import { tenantlessModel, tenantModel } from "../mongoose-multitennanted";

export interface Challenge {
  currentAmount: number;
  description: string;
  name: string;
  target: number;
  guildId: string;
}

const schema = new Schema<Challenge>({
  currentAmount: { type: Number, required: true },
  description: { type: String, required: true },
  name: { type: String, required: true },
  target: { type: Number, required: true },
  guildId: { type: String, required: true },
});

export const Challenge = tenantModel<Challenge & Document>("Challenge", schema);

export const TenantlessChallenge = tenantlessModel<Challenge & Document>(
  "Challenge",
  schema
);

console.log(TenantlessChallenge.collection.name);
