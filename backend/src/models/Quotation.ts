import mongoose, { Schema, Document } from 'mongoose';
import { QuotationStatus, RiskLevel } from '../types';

export interface IQuotationLine {
    _id: string;
    productId: string;
    productName?: string;
    variantId?: string;
    quantity: number;
    unitPrice: number;
    unitCost: number;
    discountPct: number;
    discountAmount: number;
    taxRate: number;
    taxAmount: number;
    lineTotal: number;
    lineMarginPct: number;
}

export interface IQuotation extends Document {
    _id: string;
    quotationNumber: string;
    customerId: string;
    customerName?: string;
    salesRepId: string;
    salesRepName?: string;
    status: QuotationStatus;
    lines: IQuotationLine[];
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    total: number;
    totalCost: number;
    marginPct: number;
    riskScore: number;
    riskLevel: RiskLevel;
    approvalRequired: boolean;
    approvalRoleRequired?: 'SALES_MANAGER' | 'FINANCE';
    approvalStatus?: 'NOT_REQUIRED' | 'PENDING' | 'APPROVED' | 'REJECTED';
    validityDate: Date;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const QuotationLineSchema = new Schema(
    {
        _id: { type: String },
        productId: { type: String, required: true },
        productName: { type: String },
        variantId: { type: String },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        unitCost: { type: Number, required: true },
        discountPct: { type: Number, required: true },
        discountAmount: { type: Number, required: true },
        taxRate: { type: Number, required: true },
        taxAmount: { type: Number, required: true },
        lineTotal: { type: Number, required: true },
        lineMarginPct: { type: Number, required: true },
    }
);

const QuotationSchema = new Schema(
    {
        _id: { type: String, required: true },
        quotationNumber: { type: String, required: true, unique: true },
        customerId: { type: String, required: true },
        customerName: { type: String },
        salesRepId: { type: String, required: true },
        salesRepName: { type: String },
        status: {
            type: String,
            enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'UNDER_NEGOTIATION', 'CONFIRMED', 'CANCELLED'],
            required: true,
        },
        lines: [QuotationLineSchema],
        subtotal: { type: Number, required: true },
        discountAmount: { type: Number, required: true },
        taxAmount: { type: Number, required: true },
        total: { type: Number, required: true },
        totalCost: { type: Number, required: true },
        marginPct: { type: Number, required: true },
        riskScore: { type: Number, required: true },
        riskLevel: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], required: true },
        approvalRequired: { type: Boolean, required: true },
        approvalRoleRequired: { type: String, enum: ['SALES_MANAGER', 'FINANCE'] },
        approvalStatus: { type: String, enum: ['NOT_REQUIRED', 'PENDING', 'APPROVED', 'REJECTED'] },
        validityDate: { type: Date, required: true },
        notes: { type: String },
    },
    { timestamps: true }
);

export default mongoose.model<IQuotation>('Quotation', QuotationSchema);
