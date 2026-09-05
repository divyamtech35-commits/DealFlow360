import { Request, Response, NextFunction } from 'express';
import { RecommendationService } from '../services/recommendation.service';
import { sendSuccess } from '../utils/response';

export class RecommendationController {
  public static async getForQuotation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const recommendations = await RecommendationService.getRecommendationsForQuotation(req.params.id);
      sendSuccess(res, recommendations);
    } catch (error) {
      next(error);
    }
  }
}
