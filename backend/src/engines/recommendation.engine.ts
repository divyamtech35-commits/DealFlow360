import { Product, QuotationLine, UpsellRule } from '../types';

export interface RecommendationItem {
  recommendedProduct: Product;
  triggerProductName: string;
  ruleType: 'UPSELL' | 'CROSS_SELL' | 'ADDON';
  discountIncentivePct: number;
  reason: string;
}

export class RecommendationEngine {
  /**
   * Deterministically evaluates basket line items against upsell rules to recommend complementary products.
   */
  public static getRecommendations(
    lines: QuotationLine[],
    rules: UpsellRule[],
    allProducts: Product[]
  ): RecommendationItem[] {
    const existingProductIds = new Set(lines.map((l) => l.productId));
    const recommendations: RecommendationItem[] = [];

    for (const line of lines) {
      // Find rules triggered by this product
      const matchingRules = rules.filter((r) => r.triggerProductId === line.productId);

      for (const rule of matchingRules) {
        // Only suggest if not already in the quotation basket
        if (!existingProductIds.has(rule.recommendedProductId)) {
          const recProduct = allProducts.find((p) => p.id === rule.recommendedProductId);
          if (recProduct) {
            recommendations.push({
              recommendedProduct: recProduct,
              triggerProductName: line.productName || 'Selected item',
              ruleType: rule.ruleType,
              discountIncentivePct: rule.discountIncentivePct,
              reason: rule.reason,
            });
            // Avoid duplicate recommendations for the same target product
            existingProductIds.add(rule.recommendedProductId);
          }
        }
      }
    }

    return recommendations;
  }
}
