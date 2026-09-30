// src/lib/expenseService.ts
import { getApiUrl } from './apiConfig';
import { ExpenseCategory, PaymentMethod } from './ocrVisionService';

export interface Expense {
  id: string;
  company_id: number;
  project_id?: string | null;
  client_id?: number | null;
  merchant: string;
  category: ExpenseCategory;
  invoice_number: string;
  date: string;
  amount_ht: number;
  amount_tva: number;
  tva_rate: number;
  amount_ttc: number;
  payment_method: PaymentMethod;
  receipt_url?: string | null;
  notes?: string;
  created_at: string;
}

export interface ExpenseStats {
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
  count: number;
  byCategory: Record<string, number>;
}

export async function fetchExpenses(
  companyId?: number,
  filters?: { projectId?: string; clientId?: number; category?: string }
): Promise<{ expenses: Expense[]; stats: ExpenseStats }> {
  const cid = companyId || 1;
  const params = new URLSearchParams({ company_id: cid.toString() });
  if (filters?.projectId) params.append('project_id', filters.projectId);
  if (filters?.clientId) params.append('client_id', filters.clientId.toString());
  if (filters?.category) params.append('category', filters.category);

  const res = await fetch(getApiUrl(`expenses.php?${params.toString()}`));
  if (!res.ok) throw new Error('Erreur lors du chargement des dépenses');
  const data = await res.json();
  return {
    expenses: data.expenses || [],
    stats: data.stats || { totalHT: 0, totalTVA: 0, totalTTC: 0, count: 0, byCategory: {} }
  };
}

export async function saveExpense(
  expense: Partial<Expense>,
  companyId?: number
): Promise<{ success: boolean; expense: Expense }> {
  const cid = companyId || expense.company_id || 1;
  const res = await fetch(getApiUrl('expenses.php'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...expense, company_id: cid })
  });
  if (!res.ok) throw new Error("Erreur lors de l'enregistrement de la dépense");
  return res.json();
}

export async function deleteExpense(id: string, companyId?: number): Promise<boolean> {
  const cid = companyId || 1;
  const res = await fetch(getApiUrl(`expenses.php?id=${id}&company_id=${cid}`), {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Erreur lors de la suppression');
  const data = await res.json();
  return !!data.success;
}

export function getExpensesExportUrl(companyId?: number): string {
  const cid = companyId || 1;
  return getApiUrl(`expenses_export.php?company_id=${cid}`);
}
