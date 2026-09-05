import { ProductRepository } from '../repositories/product.repository';
import { QuotationRepository } from '../repositories/quotation.repository';
import { RecommendationEngine, RecommendationItem } from '../engines/recommendation.engine';

export class RecommendationService {
  public static async getRecommendationsForQuotation(quotationId: string): Promise<RecommendationItem[]> {
    const quotation = await QuotationRepository.findById(quotationId);
    if (!quotation) return [];

    const upsellRules = await ProductRepository.getUpsellRules();
    const allProducts = await ProductRepository.getAll();

    return RecommendationEngine.getRecommendations(quotation.lines, upsellRules, allProducts);
  }
}
