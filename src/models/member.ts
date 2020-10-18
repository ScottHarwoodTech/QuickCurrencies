import { Document, Schema } from "mongoose";
import { tenantlessModel, tenantModel } from "../mongoose-multitennanted";

export interface Member {
  currency: number;
  memberId: string;
  guildId: string;
}
const schema = new Schema<Member>({
  _id: { type: String },
  currency: { type: Number, required: true },
  memberId: { type: String, required: true, index: true },
  guildId: { type: String, required: true },
});

export const Member = tenantModel<Member & Document>("Member", schema);

export const TenantlessMember = tenantlessModel<Member & Document>(
  "Member",
  schema
);
