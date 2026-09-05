import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from '../types';

export interface IUser extends Document {
    _id: string;
    name: string;
    email: string;
    passwordHash?: string;
    role: UserRole;
    customerId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema(
    {
        _id: { type: String, required: true },
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        passwordHash: { type: String },
        role: { type: String, enum: ['ADMIN', 'SALES_REP', 'SALES_MANAGER', 'FINANCE', 'CUSTOMER'], required: true },
        customerId: { type: String },
    },
    { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
