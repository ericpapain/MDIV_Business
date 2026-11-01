import { getDb, saveDb, type DatabaseSchema } from '../db-connection';

export abstract class BaseRepository<T extends { id: any; company_id?: any }> {
  protected abstract collectionKey: keyof DatabaseSchema;

  protected getCollection(): T[] {
    const db = getDb();
    if (!Array.isArray(db[this.collectionKey])) {
      (db as any)[this.collectionKey] = [];
    }
    return (db as any)[this.collectionKey] as T[];
  }

  protected persist(items: T[]): void {
    const db = getDb();
    (db as any)[this.collectionKey] = items;
    saveDb();
  }

  public findAll(companyId?: number): T[] {
    const items = this.getCollection();
    if (companyId === undefined || companyId === null) return items;
    return items.filter(item => !item.company_id || item.company_id === companyId);
  }

  public findById(id: any, companyId?: number): T | null {
    const items = this.findAll(companyId);
    return items.find(item => String(item.id) === String(id)) || null;
  }

  public insert(item: T): T {
    const items = this.getCollection();
    items.unshift(item);
    this.persist(items);
    return item;
  }

  public update(id: any, updates: Partial<T>, companyId?: number): T | null {
    const items = this.getCollection();
    const index = items.findIndex(item => String(item.id) === String(id) && (!companyId || item.company_id === companyId));
    if (index === -1) return null;
    items[index] = { ...items[index], ...updates, id: items[index].id };
    this.persist(items);
    return items[index];
  }

  public delete(id: any, companyId?: number): boolean {
    const items = this.getCollection();
    const initialLength = items.length;
    const filtered = items.filter(item => !(String(item.id) === String(id) && (!companyId || item.company_id === companyId)));
    if (filtered.length === initialLength) return false;
    this.persist(filtered);
    return true;
  }
}
