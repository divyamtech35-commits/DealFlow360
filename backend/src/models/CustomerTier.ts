import mongoose, { Schema, Document } from 'mongoose';
import { CustomerTierName } from '../types';

export interface ICustomerTier extends Document {
    _id: string;
    name: CustomerTierName;
    baseDiscountLimitPct: number;
    priorityLevel: number;
    paymentTermsDays: number;
}

const CustomerTierSchema = new Schema({
    _id: { type: String, required: true },
    name: { type: String, enum: ['Bronze', 'Silver', 'Gold', 'Enterprise'], required: true },
    baseDiscountLimitPct: { type: Number, required: true },
    priorityLevel: { type: Number, required: true },
    paymentTermsDays: { type: Number, required: true },
});

export default mongoose.model<ICustomerTier>('CustomerTier', CustomerTierSchema);
