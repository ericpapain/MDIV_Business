import { getDb, saveDb } from '../../database/db-connection';

export class PersonaService {
  getPersona(companyId: number) {
    const db = getDb();
    if (!db.personas) db.personas = [];

    // 1. Chercher dans db.personas
    const directPersona = db.personas.find((p: any) => p.company_id === companyId || p.id === companyId);
    if (directPersona) {
      return directPersona;
    }

    // 2. Chercher dans db.companies
    const company = (db.companies || []).find((c: any) => c.id === companyId) || (db.companies || [])[0];
    if (company && company.persona) {
      return company.persona;
    }

    return null;
  }

  savePersona(companyId: number, personaData: any) {
    const db = getDb();
    if (!db.personas) db.personas = [];
    if (!db.companies) db.companies = [];

    const cid = companyId || personaData.companyId || personaData.company_id || 1;

    const fullPersona = {
      ...personaData,
      company_id: cid,
      companyId: cid,
      updated_at: new Date().toISOString()
    };

    // 1. Sauvegarde dans db.personas
    const existingIndex = db.personas.findIndex((p: any) => p.company_id === cid || p.id === cid);
    if (existingIndex >= 0) {
      db.personas[existingIndex] = { ...db.personas[existingIndex], ...fullPersona };
    } else {
      db.personas.push(fullPersona);
    }

    // 2. Synchronisation dans db.companies
    const compIndex = db.companies.findIndex((c: any) => c.id === cid);
    if (compIndex >= 0) {
      db.companies[compIndex].persona = { ...(db.companies[compIndex].persona || {}), ...fullPersona };
      if (fullPersona.specificActivity || fullPersona.customMetier || fullPersona.metierLabel) {
        db.companies[compIndex].activity = fullPersona.specificActivity || fullPersona.customMetier || fullPersona.metierLabel;
      }
      if (fullPersona.companyName && !db.companies[compIndex].company_name) {
        db.companies[compIndex].company_name = fullPersona.companyName;
      }
    }

    saveDb(db);
    return fullPersona;
  }
}

export const personaService = new PersonaService();

