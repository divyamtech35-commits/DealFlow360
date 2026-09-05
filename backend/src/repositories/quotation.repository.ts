import QuotationModel from '../models/Quotation';
import { Quotation } from '../types';

const cleanDoc = (doc: any) => {
  if (!doc) return null;
  const obj = doc;
  obj.id = obj._id.toString();
  // Map lines id if needed
  if (obj.lines) {
    obj.lines = obj.lines.map((l: any) => {
      l.id = l._id ? l._id.toString() : undefined;
      return l;
    });
  }
  delete obj._id;
  delete obj.__v;
  return obj;
};

export class QuotationRepository {
  public static async getAll(filter?: { customerId?: string; salesRepId?: string }): Promise<Quotation[]> {
    let query: any = {};
    if (filter?.customerId) query.customerId = filter.customerId;
    if (filter?.salesRepId) query.salesRepId = filter.salesRepId;

    const docs = await QuotationModel.find(query).sort({ createdAt: -1 }).lean();
    return docs.map(cleanDoc) as unknown as Quotation[];
  }

  public static async findById(id: string): Promise<Quotation | null> {
    const doc = await QuotationModel.findById(id).lean();
    if (!doc) return null;
    return cleanDoc(doc) as unknown as Quotation;
  }

  public static async create(quotation: Quotation): Promise<Quotation> {
    const doc = await QuotationModel.create(quotation);
    return cleanDoc(doc.toObject()) as unknown as Quotation;
  }

  public static async update(id: string, partial: Partial<Quotation>): Promise<Quotation | null> {
    const doc = await QuotationModel.findByIdAndUpdate(id, partial, { new: true }).lean();
    if (!doc) return null;
    return cleanDoc(doc) as unknown as Quotation;
  }

  public static async delete(id: string): Promise<boolean> {
    const result = await QuotationModel.deleteOne({ _id: id });
    return result.deletedCount === 1;
  }
}
