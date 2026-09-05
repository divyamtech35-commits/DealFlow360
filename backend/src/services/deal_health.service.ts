import { QuotationRepository } from '../repositories/quotation.repository';
import { DealHealthRepository } from '../repositories/deal_health.repository';
import { FulfillmentRepository } from '../repositories/fulfillment.repository';
import { DealHealthEngine } from '../engines/deal_health.engine';
import { DealHealthAlert } from '../types';

export class DealHealthService {
  public static async getAllAlerts(): Promise<DealHealthAlert[]> {
    // Scan active quotations and generate live alerts
    const quotations = await QuotationRepository.getAll();
    const orders = await FulfillmentRepository.getAllOrders();

    for (const q of quotations) {
      const order = orders.find((o) => o.quotationId === q.id);
      const hasBackorders = (order?.backorders?.length || 0) > 0;

      const alerts = DealHealthEngine.evaluateDealHealth({
        quotation: q,
        daysInCurrentStatus: 3,
        hasBackorders,
      });

      if (alerts.length > 0) {
        await DealHealthRepository.addAlerts(alerts);
      }
    }

    return DealHealthRepository.getAll();
  }

  public static async getAlertsForQuotation(quotationId: string): Promise<DealHealthAlert[]> {
    return DealHealthRepository.getAll({ quotationId });
  }

  public static async resolveAlert(id: string): Promise<boolean> {
    return DealHealthRepository.resolveAlert(id);
  }
}
