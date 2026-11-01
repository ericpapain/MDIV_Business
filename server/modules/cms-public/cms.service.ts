import { getDb, saveDb } from '../../database/db-connection';

export class CmsService {
  getSavedWorks(companyId: number) {
    const db = getDb();
    let results = db.savedWorks || [];
    if (companyId) {
      results = results.filter((w: any) => !w.company_id || w.company_id === companyId);
    }
    return results;
  }

  saveWork(companyId: number, fields: any) {
    const db = getDb();
    if (!db.savedWorks) db.savedWorks = [];

    const newWork = {
      id: fields.id || ('work_' + Date.now()),
      company_id: companyId,
      tool: fields.tool || 'general',
      title: fields.title || 'Travail sauvegardé',
      content: fields.content || '',
      summary: fields.summary || '',
      created_at: new Date().toISOString(),
    };

    db.savedWorks.unshift(newWork);
    saveDb(db);
    return newWork;
  }

  deleteSavedWork(companyId: number, workId: string) {
    const db = getDb();
    if (!db.savedWorks) return true;
    db.savedWorks = db.savedWorks.filter((w: any) => !(String(w.id) === String(workId) && (!companyId || w.company_id === companyId)));
    saveDb(db);
    return true;
  }

  getBenchmarkStats(sector = 'BTP & Services') {
    return {
      sector,
      sample_size: 1420,
      kpis: {
        digital_maturity_avg: 64,
        ai_adoption_rate: 42,
        avg_payment_delay_days: 34,
        quote_conversion_rate: 48,
      },
      leaders_benchmark: {
        digital_maturity: 88,
        ai_adoption_rate: 85,
        avg_payment_delay_days: 18,
        quote_conversion_rate: 68,
      },
    };
  }
}

export const cmsService = new CmsService();
