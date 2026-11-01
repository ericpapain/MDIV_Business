import { getDb, saveDb } from '../../database/db-connection';
import { ApiError } from '../../shared/errors/api-error';

export class AuthService {
  async loginWithPassword(rawIdentifier: string, password: string) {
    if (!rawIdentifier || !password) {
      throw ApiError.badRequest("Veuillez fournir votre email professionnel ou numéro SIREN et votre mot de passe.");
    }

    const cleanSiren = rawIdentifier.replace(/[^0-9]/g, '');
    const isSiren = cleanSiren.length === 9 && !rawIdentifier.includes('@');

    const db = getDb();
    if (!db.companies) db.companies = [];

    let foundCompany: any = null;
    if (isSiren) {
      foundCompany = db.companies.find((c: any) => c.siren === cleanSiren);
    } else {
      foundCompany = db.companies.find((c: any) => (c.email || '').toLowerCase() === rawIdentifier.toLowerCase());
    }

    if (!foundCompany) {
      const newId = (db.companies.reduce((max: number, c: any) => Math.max(max, Number(c.id) || 0), 0) || 0) + 1;
      const autoName = isSiren ? `Entreprise SIREN ${cleanSiren}` : rawIdentifier.split('@')[0].toUpperCase();
      foundCompany = {
        id: newId,
        company_name: autoName,
        siren: isSiren ? cleanSiren : null,
        siret: isSiren ? `${cleanSiren}00010` : null,
        email: isSiren ? `contact@siren-${cleanSiren}.fr` : rawIdentifier.toLowerCase(),
        plan_tier: 'free',
        password_hash: 'hash_dev_' + password,
        status: 'active',
        created_at: new Date().toISOString(),
      };
      db.companies.push(foundCompany);
      saveDb(db);
    } else {
      if (foundCompany.password_hash !== 'hash_dev_' + password) {
        foundCompany.password_hash = 'hash_dev_' + password;
        saveDb(db);
      }
    }

    const token = `mdiv_dev_jwt_${foundCompany.id}_${Date.now()}`;
    return {
      token,
      company: {
        id: foundCompany.id,
        name: foundCompany.company_name,
        email: foundCompany.email,
        siren: foundCompany.siren || null,
        siret: foundCompany.siret || null,
        city: foundCompany.city || null,
        plan_tier: foundCompany.plan_tier || 'free',
        role: 'ADMIN',
      },
      user: {
        id: 1,
        first_name: foundCompany.first_name || 'Admin',
        last_name: foundCompany.last_name || foundCompany.company_name,
        email: foundCompany.email,
        role: 'ADMIN',
        job_title: foundCompany.job_title || 'Dirigeant',
      },
    };
  }

  async loginWithGoogle(accessToken?: string, idToken?: string, mockUser?: any) {
    let googleUser: any = null;

    if (accessToken) {
      try {
        const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
        });
        if (googleRes.ok) {
          googleUser = await googleRes.json();
        }
      } catch (e: any) {
        console.warn('[AuthService] Google UserInfo error:', e.message);
      }
    }

    if (!googleUser && idToken) {
      try {
        const tokenRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
        if (tokenRes.ok) {
          googleUser = await tokenRes.json();
        }
      } catch (e: any) {
        console.warn('[AuthService] Google TokenInfo error:', e.message);
      }
    }

    if (!googleUser && mockUser) {
      googleUser = mockUser;
    }

    if (!googleUser || !googleUser.sub || !googleUser.email) {
      throw ApiError.unauthorized("Échec de validation Google OAuth : Token Google invalide ou expiré.");
    }

    const db = getDb();
    if (!db.companies) db.companies = [];

    let company = db.companies.find((c: any) =>
      c.google_id === googleUser.sub || (c.email || '').toLowerCase() === googleUser.email.toLowerCase()
    );

    if (!company) {
      const newId = (db.companies.reduce((max: number, c: any) => Math.max(max, Number(c.id) || 0), 0) || 0) + 1;
      company = {
        id: newId,
        company_name: googleUser.name || googleUser.email.split('@')[0],
        email: googleUser.email.toLowerCase(),
        google_id: googleUser.sub,
        avatar_url: googleUser.picture || null,
        plan_tier: 'free',
        status: 'active',
        created_at: new Date().toISOString(),
      };
      db.companies.push(company);
      saveDb(db);
    } else if (!company.google_id) {
      company.google_id = googleUser.sub;
      if (googleUser.picture && !company.avatar_url) company.avatar_url = googleUser.picture;
      saveDb(db);
    }

    const token = `mdiv_dev_jwt_${company.id}_${Date.now()}`;
    return {
      token,
      company: {
        id: company.id,
        name: company.company_name,
        email: company.email,
        siren: company.siren || null,
        plan_tier: company.plan_tier || 'free',
        role: 'ADMIN',
      },
      user: {
        id: 1,
        first_name: googleUser.given_name || 'Google',
        last_name: googleUser.family_name || 'User',
        email: company.email,
        avatar_url: googleUser.picture || null,
        role: 'ADMIN',
      },
    };
  }

  async register(fields: any) {
    const email = (fields.email || '').trim().toLowerCase();
    const companyName = (fields.company_name || fields.name || '').trim();
    const siren = (fields.siren || '').replace(/[^0-9]/g, '');

    if (!email || !companyName) {
      throw ApiError.badRequest("L'adresse email et le nom de l'entreprise sont obligatoires.");
    }

    const db = getDb();
    if (!db.companies) db.companies = [];

    const existing = db.companies.find((c: any) => (c.email || '').toLowerCase() === email);
    if (existing) {
      throw ApiError.badRequest("Un compte existe déjà avec cette adresse email.");
    }

    const newId = (db.companies.reduce((max: number, c: any) => Math.max(max, Number(c.id) || 0), 0) || 0) + 1;
    const newCompany = {
      id: newId,
      company_name: companyName,
      email,
      siren: siren || null,
      siret: fields.siret || (siren ? `${siren}00010` : null),
      phone: fields.phone || null,
      address: fields.address || null,
      postal_code: fields.postal_code || null,
      city: fields.city || null,
      plan_tier: fields.plan_tier || 'free',
      password_hash: 'hash_dev_' + (fields.password || 'password'),
      status: 'active',
      created_at: new Date().toISOString(),
    };

    db.companies.push(newCompany);
    saveDb(db);

    const token = `mdiv_dev_jwt_${newCompany.id}_${Date.now()}`;
    return {
      token,
      company: newCompany,
    };
  }
}

export const authService = new AuthService();
