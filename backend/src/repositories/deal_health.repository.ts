import { InMemoryStore } from './in_memory_store';
import { DealHealthAlert } from '../types';

export class DealHealthRepository {
  public static async getAll(filter?: { quotationId?: string; status?: string }): Promise<DealHealthAlert[]> {
    let list = InMemoryStore.dealHealthAlerts;
    if (filter?.quotationId) {
      list = list.filter((a) => a.quotationId === filter.quotationId);
    }
    if (filter?.status) {
      list = list.filter((a) => a.status === filter.status);
    }
    return list;
  }

  public static async addAlerts(alerts: DealHealthAlert[]): Promise<void> {
    for (const alert of alerts) {
      const existingIdx = InMemoryStore.dealHealthAlerts.findIndex((a) => a.id === alert.id);
      if (existingIdx >= 0) {
        InMemoryStore.dealHealthAlerts[existingIdx] = alert;
      } else {
        InMemoryStore.dealHealthAlerts.unshift(alert);
      }
    }
  }

  public static async resolveAlert(id: string): Promise<boolean> {
    const alert = InMemoryStore.dealHealthAlerts.find((a) => a.id === id);
    if (alert) {
      alert.status = 'RESOLVED';
      return true;
    }
    return false;
  }
}
