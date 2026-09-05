import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
    _id: string;
    name: string;
    tierId: string;
    salesRepId: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    creditLimit: number;
    creditStatus: 'GOOD' | 'WARNING' | 'BLOCKED';
    riskProfile: 'LOW' | 'MEDIUM' | 'HIGH';
    createdAt: Date;
    updatedAt: Date;
}

const CustomerSchema = new Schema(
    {
        _id: { type: String, required: true },
        name: { type: String, required: true },
        tierId: { type: String, required: true },
        salesRepId: { type: String, required: true },
        contactEmail: { type: String, required: true },
        contactPhone: { type: String, required: true },
        address: { type: String, required: true },
        creditLimit: { type: Number, required: true },
        creditStatus: { type: String, enum: ['GOOD', 'WARNING', 'BLOCKED'], required: true },
        riskProfile: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], required: true },
    },
    { timestamps: true }
);

export default mongoose.model<ICustomer>('Customer', CustomerSchema);
