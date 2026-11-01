import { getDb, saveDb } from '../../database/db-connection';
import { inseeSirenClient } from '../../integrations/search/insee-siren.client';
import { ApiError } from '../../shared/errors/api-error';

export class CompanyService {
  getProfile(companyId: number) {
    const db = getDb();
    const companies = db.companies || [];
    const found = companies.find((c: any) => c.id === companyId) || companies[0] || {
      id: 4,
      company_name: "M.DIV CONSULTING",
      email: "direction@mdiv-business.fr",
      phone: "01 80 90 20 26",
      city: "Paris",
      plan_tier: "enterprise",
    };
    return found;
  }

  updateProfile(companyId: number, fields: any) {
    const db = getDb();
    if (!db.companies) db.companies = [];

    const index = db.companies.findIndex((c: any) => c.id === companyId);
    if (index === -1) {
      const newCompany = {
        id: companyId,
        ...fields,
        updated_at: new Date().toISOString(),
      };
      db.companies.push(newCompany);
      saveDb(db);
      return newCompany;
    }

    db.companies[index] = {
      ...db.companies[index],
      ...fields,
      id: db.companies[index].id,
      updated_at: new Date().toISOString(),
    };
    saveDb(db);
    return db.companies[index];
  }

  async searchInsee(query: string) {
    if (!query) return [];
    return await inseeSirenClient.searchCompanies(query);
  }
}

export const companyService = new CompanyService();
