// src/lib/fintechKolectoService.ts
// Service FinTech Kolecto MDIV Business (Sécurité Anti-Fraude IBAN, Factur-X 2026, SEPA 3 Clics, Rapprochement Bancaire, FEC)

import { getApiUrl } from './apiConfig';

export interface IbanSecurityCheckResult {
  success: boolean;
  iban: string;
  formattedIban: string;
  country: string;
  verdict: 'SAFE_VERIFIED' | 'FIRST_SEEN_IBAN' | 'CRITICAL_ALTERED_IBAN' | 'CRITICAL_INVALID_IBAN' | 'SUSPICIOUS_OFFSHORE_IBAN';
  severity: 'success' | 'warning' | 'danger';
  badge: string;
  score: number;
  explanation: string;
  canPay: boolean;
  duplicateDetected: boolean;
  duplicateReference?: string;
  analyzedAt: string;
}

export interface FacturXGenerationResult {
  success: boolean;
  invoiceNumber: string;
  pdpStatus: 'DEPOSITED' | 'REJECTED' | 'REFUSED' | 'COLLECTED';
  audit: {
    statusLabel: string;
    timestamp: string;
    pdpRegistrationNumber: string;
    format: string;
    xmlSize: number;
  };
  xmlLength: number;
  xmlPreview: string;
  downloadUrl: string;
}

export interface SepaTransferItem {
  expenseId: string;
  creditorName: string;
  creditorIban: string;
  amount: number;
  invoiceReference: string;
}

export interface SepaPaymentExecutionResult {
  success: boolean;
  orderId: string;
  totalAmount: number;
  transactionsCount: number;
  status: string;
  message: string;
  sepaXmlPreview: string;
  downloadUrl: string;
}

export interface ReconciliationItem {
  transaction: {
    id: string;
    date: string;
    label: string;
    amount: number;
    type: 'credit' | 'debit';
    is_reconciled: boolean;
    matched_document_id?: string;
  };
  suggestedMatch?: {
    documentType: 'invoice' | 'expense';
    documentId: string;
    reference: string;
    thirdParty: string;
    amount: number;
    date: string;
    confidenceScore: number;
  };
  confidenceScore: number;
  canAutoReconcile: boolean;
}

export interface FecExportDiagnosis {
  success: boolean;
  filename: string;
  fiscalYear: number;
  siren: string;
  entriesCount: number;
  linesCount: number;
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
  preview: string[];
  accountsSummary?: Array<{ code: string; name: string; debit: number; credit: number }>;
  downloadUrl: string;
  compatibleSoftware: string[];
}

/**
 * 1. Vérifie un IBAN en temps réel contre la fraude au faux RIB et doublons
 */
export async function verifySupplierIban(params: {
  iban: string;
  supplierName?: string;
  supplierSiret?: string;
  invoiceNumber?: string;
  amountTTC?: number;
  companyId?: number;
}): Promise<IbanSecurityCheckResult> {
  const response = await fetch(getApiUrl('fraud_check_iban.php'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      company_id: params.companyId || 1,
      supplier_name: params.supplierName || '',
      supplier_siret: params.supplierSiret || '',
      iban: params.iban,
      invoice_number: params.invoiceNumber || '',
      amount_ttc: params.amountTTC || 0
    })
  });
  if (!response.ok) throw new Error("Erreur de connexion au moteur de contrôle anti-fraude IBAN.");
  return response.json();
}

/**
 * 2. Génère le flux Factur-X XML officiel et gère le statut PDP DGFIP
 */
export async function generateFacturX(invoiceData: any): Promise<FacturXGenerationResult> {
  const response = await fetch(getApiUrl('facturx_generator.php'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(invoiceData)
  });
  if (!response.ok) throw new Error("Erreur lors de la génération du format Factur-X.");
  return response.json();
}

/**
 * 3. Exécute le paiement fournisseur en 3 clics par virement SEPA direct (ISO 20022 pain.001.001.03)
 */
export async function executeSepaPayment(params: {
  transfers: SepaTransferItem[];
  debtorName?: string;
  debtorIban?: string;
  debtorBic?: string;
  companyId?: number;
}): Promise<SepaPaymentExecutionResult> {
  const response = await fetch(getApiUrl('sepa_payment.php'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!response.ok) throw new Error("Erreur lors de l'exécution de l'ordre de virement SEPA.");
  return response.json();
}

/**
 * 4. Récupère la file de rapprochement bancaire avec scores de corrélation
 */
export async function fetchBankReconciliationQueue(companyId?: number): Promise<{
  totalTransactions: number;
  unreconciledCount: number;
  queue: ReconciliationItem[];
}> {
  const response = await fetch(getApiUrl('bank_reconciliation.php') + `?company_id=${companyId || 1}`);
  if (!response.ok) throw new Error("Erreur lors du chargement des relevés bancaires.");
  return response.json();
}

/**
 * 5. Valide un rapprochement bancaire entre une écriture et une facture/dépense
 */
export async function validateReconciliation(transactionId: string, documentId: string, documentType: 'invoice' | 'expense') {
  const response = await fetch(getApiUrl('bank_reconciliation.php') + '?action=reconcile_match', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      transaction_id: transactionId,
      document_id: documentId,
      document_type: documentType
    })
  });
  if (!response.ok) throw new Error("Erreur lors de l'enregistrement du rapprochement.");
  return response.json();
}

/**
 * 6. Génère l'audit et le fichier FEC (Fichier des Écritures Comptables)
 */
export async function generateFecAudit(companyId?: number, year?: number, siren?: string): Promise<FecExportDiagnosis> {
  const params = new URLSearchParams();
  if (companyId) params.append('company_id', companyId.toString());
  if (year) params.append('year', year.toString());
  if (siren) params.append('siren', siren);

  const response = await fetch(getApiUrl('fec_export.php') + '?' + params.toString());
  if (!response.ok) throw new Error("Erreur lors de la génération du FEC.");
  return response.json();
}
