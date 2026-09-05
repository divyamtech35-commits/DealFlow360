import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
    _id: string;
    sku: string;
    name: string;
    categoryId: string;
    basePrice: number;
    unitCost: number;
    isSubscription: boolean;
    subscriptionInterval?: 'MONTHLY' | 'ANNUAL';
    stockTrackable: boolean;
    status: 'ACTIVE' | 'ARCHIVED';
    description?: string;
}

const ProductSchema = new Schema({
    _id: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    categoryId: { type: String, required: true },
    basePrice: { type: Number, required: true },
    unitCost: { type: Number, required: true },
    isSubscription: { type: Boolean, required: true },
    subscriptionInterval: { type: String, enum: ['MONTHLY', 'ANNUAL'] },
    stockTrackable: { type: Boolean, required: true },
    status: { type: String, enum: ['ACTIVE', 'ARCHIVED'], required: true },
    description: { type: String },
});

export default mongoose.model<IProduct>('Product', ProductSchema);
