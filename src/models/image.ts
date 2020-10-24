import { Document, Schema } from "mongoose";
import { tenantlessModel, tenantModel } from "../mongoose-multitennanted";

export interface Image {
  location: string;
  guildId: string;
  text?: string;
}

const schema = new Schema<Image>({
  guildId: { type: String, required: true },
  location: { type: String, required: true },
  text: { type: String },
});

export const Image = tenantModel<Image & Document>("Images", schema);

export const TenantlessImage = tenantlessModel<Image & Document>(
  "Images",
  schema
);
