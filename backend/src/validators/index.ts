import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).optional(),
});

export const CreateCustomerSchema = z.object({
  name: z.string().min(2),
  tierId: z.string().min(1),
  salesRepId: z.string().min(1),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(3),
  address: z.string().min(3),
  creditLimit: z.number().nonnegative(),
  creditStatus: z.enum(['GOOD', 'WARNING', 'BLOCKED']).default('GOOD'),
  riskProfile: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('LOW'),
});

export const QuotationLineInputSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
  quantity: z.number().int().positive(),
  discountPct: z.number().min(0).max(100).default(0),
});

export const CreateQuotationSchema = z.object({
  customerId: z.string().min(1),
  lines: z.array(QuotationLineInputSchema).min(1),
  notes: z.string().optional(),
  validityDays: z.number().int().positive().optional(),
});

export const CalculateQuotationSchema = z.object({
  customerId: z.string().min(1),
  lines: z.array(QuotationLineInputSchema).min(1),
});

export const ApprovalActionSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT']),
  comment: z.string().min(1),
});

export const NegotiationStartSchema = z.object({
  requestedDiscountPct: z.number().min(0).max(100),
  initialMessage: z.string().min(1),
});

export const NegotiationMessageSchema = z.object({
  message: z.string().min(1),
});

export const NegotiationCounterSchema = z.object({
  counterDiscountPct: z.number().min(0).max(100),
  message: z.string().min(1),
});

export const PaymentSchema = z.object({
  amount: z.number().positive(),
  paymentMethod: z.enum(['CREDIT_CARD', 'WIRE_TRANSFER', 'ACH', 'CHECK']),
  referenceNumber: z.string().optional(),
});

export const UpdateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'ALLOCATED', 'PARTIALLY_ALLOCATED', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
});
