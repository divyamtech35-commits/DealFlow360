import { InMemoryStore } from './in_memory_store';
import { AuditLog, UserRole } from '../types';

export class AuditRepository {
  public static async log(entry: {
    actorId: string;
    actorName: string;
    actorRole: UserRole;
    entityType: string;
    entityId: string;
    action: string;
    oldValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
    comment?: string;
  }): Promise<AuditLog> {
    const auditLog: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      actorId: entry.actorId,
      actorName: entry.actorName,
      actorRole: entry.actorRole,
      entityType: entry.entityType,
      entityId: entry.entityId,
      action: entry.action,
      oldValues: entry.oldValues,
      newValues: entry.newValues,
      timestamp: new Date().toISOString(),
      comment: entry.comment,
    };

    InMemoryStore.auditLogs.unshift(auditLog);
    return auditLog;
  }

  public static async getAll(filter?: { entityType?: string; entityId?: string }): Promise<AuditLog[]> {
    let list = InMemoryStore.auditLogs;
    if (filter?.entityType) {
      list = list.filter((l) => l.entityType === filter.entityType);
    }
    if (filter?.entityId) {
      list = list.filter((l) => l.entityId === filter.entityId);
    }
    return list;
  }
}
