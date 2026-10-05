// src/lib/pdfExportService.ts
/**
 * Service d'exportation et de génération de documents PDF haute fidélité (A4 vectoriel).
 * Utilise jsPDF et jspdf-autotable pour garantir une netteté vectorielle optimale
 * et un téléchargement direct sans passer par du rendu HTML dégradé.
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface CompanyInfo {
  name?: string;
  siret?: string;
  vatNumber?: string;
  address?: string;
  email?: string;
  phone?: string;
  iban?: string;
  bic?: string;
}

export interface ClientInfo {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
  siret?: string;
}

export interface DocumentLineItem {
  id?: string;
  description: string;
  quantity: number;
  unitPriceHT: number;
  vatRate: number;
  discountPercentage?: number;
}

export interface InvoiceExportData {
  invoiceNumber: string;
  issueDate?: string;
  dueDate?: string;
  client?: ClientInfo;
  clientName?: string;
  lines: DocumentLineItem[];
  downpayment?: number;
  totals?: {
    totalHT: number;
    totalVAT: number;
    totalTTC: number;
  };
  notes?: string;
  paymentTerms?: string;
  company?: CompanyInfo;
}

export interface QuoteExportData {
  quoteNumber: string;
  date?: string;
  validityDays?: number;
  client?: ClientInfo;
  clientName?: string;
  lines: DocumentLineItem[];
  executiveSummary?: string;
  paymentTerms?: string;
  totals?: {
    totalHT: number;
    totalVAT: number;
    totalTTC: number;
  };
  company?: CompanyInfo;
}

export interface MeetingReportExportData {
  title: string;
  date: string;
  participants?: string[];
  summary: string;
  decisions?: string[];
  actionItems?: Array<{
    task: string;
    assignee?: string;
    deadline?: string;
    priority?: string;
  }>;
}

export interface DocumentSummaryExportData {
  documentName: string;
  mode: string;
  analysisDate?: string;
  readabilityScore?: number;
  pageCount?: number;
  timeSavedMinutes?: number;
  executiveSummary: string;
  keyTakeaways?: string[];
  actionPoints?: string[];
}

const DEFAULT_COMPANY: CompanyInfo = {
  name: "MDIV BUSINESS",
  siret: "981 123 456 00012",
  vatNumber: "FR 32 981123456",
  address: "10 Rue de la Paix, 75002 Paris, France",
  email: "contact@mdiv-business.fr",
  phone: "+33 1 89 71 20 00",
  iban: "FR76 3000 3000 0000 1234 5678 901",
  bic: "SOGEFR2N"
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0);
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return new Date().toLocaleDateString('fr-FR');
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('fr-FR');
  } catch {
    return dateStr;
  }
}

/**
 * Génère le document jsPDF pour une FACTURE
 */
export function buildInvoicePDFDoc(data: InvoiceExportData, customCompany?: CompanyInfo): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const company: CompanyInfo = {
    ...DEFAULT_COMPANY,
    ...(customCompany || {}),
    ...(data.company || {})
  };

  const client = data.client || {
    company: data.clientName || "Client Partenaire",
    name: "",
    address: "France",
    email: "",
    phone: ""
  };

  const primaryColor = [15, 23, 42]; // Slate-900 / Navy
  const accentColor = [180, 83, 9]; // Amber-700 / Gold
  const textMuted = [100, 116, 139]; // Slate-500
  const bgCard = [248, 250, 252]; // Slate-50

  const pageWidth = 210;
  const marginX = 16;
  const contentWidth = pageWidth - (marginX * 2);

  // 1. En-tête : Logo & Entreprise émettrice
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 5, 'F'); // Ligne supérieure élégante

  // Titre / Logo de l'entreprise
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(company.name || "MDIV BUSINESS", marginX, 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text("Solutions d'Intelligence Artificielle & Facturation Électronique", marginX, 27);
  doc.text(`SIRET : ${company.siret || '981 123 456 00012'} | TVA : ${company.vatNumber || 'FR 32 981123456'}`, marginX, 31.5);
  doc.text(`${company.address || 'Paris, France'} | ${company.email || 'contact@mdiv-business.fr'}`, marginX, 36);

  // Badge Factur-X / PDP
  doc.setFillColor(238, 242, 255);
  doc.roundedRect(marginX, 40, 72, 6.5, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(67, 56, 202);
  doc.text("CONFORME FACTUR-X 2026 • PDP n° 0039", marginX + 3, 44.5);

  // 2. Bloc Métadonnées Facture (à droite)
  const headerRightX = pageWidth - marginX;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("FACTURE", headerRightX, 22, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text(`N° ${data.invoiceNumber || 'FA-2026-001'}`, headerRightX, 28, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(`Date d'émission : ${formatDate(data.issueDate)}`, headerRightX, 34, { align: 'right' });
  doc.text(`Date d'échéance : ${formatDate(data.dueDate)}`, headerRightX, 39, { align: 'right' });

  // 3. Cadre Destinataire (Client)
  const clientBoxY = 52;
  doc.setFillColor(bgCard[0], bgCard[1], bgCard[2]);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(headerRightX - 85, clientBoxY, 85, 34, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text("FACTURÉ À :", headerRightX - 80, clientBoxY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  const clientTitle = client.company || client.name || "Client Partenaire";
  doc.text(clientTitle, headerRightX - 80, clientBoxY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  let lineY = clientBoxY + 17;
  if (client.name && client.name !== clientTitle) {
    doc.text(`Attn: ${client.name}`, headerRightX - 80, lineY);
    lineY += 4.5;
  }
  if (client.address) {
    doc.text(client.address, headerRightX - 80, lineY);
    lineY += 4.5;
  }
  if (client.siret) {
    doc.text(`SIREN/SIRET : ${client.siret}`, headerRightX - 80, lineY);
    lineY += 4.5;
  }
  if (client.email || client.phone) {
    doc.text([client.email, client.phone].filter(Boolean).join(' • '), headerRightX - 80, lineY);
  }

  // 4. Lignes de la facture (autoTable)
  const lines = data.lines && data.lines.length > 0 ? data.lines : [
    { description: "Prestation de services / Conseil IA", quantity: 1, unitPriceHT: 0, vatRate: 20, discountPercentage: 0 }
  ];

  let calculatedHT = 0;
  let calculatedVAT = 0;

  const tableBody = lines.map(line => {
    const qty = Number(line.quantity) || 1;
    const pu = Number(line.unitPriceHT) || 0;
    const vat = Number(line.vatRate) || 20;
    const discount = Number(line.discountPercentage) || 0;

    const baseHT = qty * pu;
    const lineHT = discount > 0 ? baseHT * (1 - discount / 100) : baseHT;
    const lineVAT = lineHT * (vat / 100);

    calculatedHT += lineHT;
    calculatedVAT += lineVAT;

    return [
      line.description || 'Prestation sans description',
      qty.toString(),
      formatCurrency(pu),
      `${vat} %`,
      discount > 0 ? `${discount} %` : '-',
      formatCurrency(lineHT)
    ];
  });

  const totals = data.totals || {
    totalHT: calculatedHT,
    totalVAT: calculatedVAT,
    totalTTC: calculatedHT + calculatedVAT
  };

  const downpayment = Number(data.downpayment) || 0;
  const netToPay = Math.max(0, totals.totalTTC - downpayment);

  autoTable(doc, {
    startY: 92,
    head: [['Description des prestations', 'Qté', 'Prix Unit. HT', 'TVA', 'Remise', 'Total HT']],
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'left',
      cellPadding: 3.5
    },
    columnStyles: {
      0: { cellWidth: 'auto', halign: 'left' },
      1: { cellWidth: 16, halign: 'center' },
      2: { cellWidth: 26, halign: 'right' },
      3: { cellWidth: 18, halign: 'center' },
      4: { cellWidth: 18, halign: 'center' },
      5: { cellWidth: 28, halign: 'right', fontStyle: 'bold' }
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [30, 41, 59],
      cellPadding: 3.5
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    margin: { left: marginX, right: marginX }
  });

  // 5. Bloc Récapitulatif Totaux (après la table)
  const finalY = (doc as any).lastAutoTable.finalY + 8;
  const totalsBoxWidth = 85;
  const totalsX = pageWidth - marginX - totalsBoxWidth;

  // Encadré Totaux
  doc.setFillColor(bgCard[0], bgCard[1], bgCard[2]);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(totalsX, finalY, totalsBoxWidth, downpayment > 0 ? 46 : 38, 2, 2, 'FD');

  let curY = finalY + 6;
  doc.setFontSize(9);

  // Total HT
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text("Total HT :", totalsX + 5, curY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(formatCurrency(totals.totalHT), totalsX + totalsBoxWidth - 5, curY, { align: 'right' });

  // TVA
  curY += 6;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text("TVA Totale :", totalsX + 5, curY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(formatCurrency(totals.totalVAT), totalsX + totalsBoxWidth - 5, curY, { align: 'right' });

  // Total TTC
  curY += 6;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text("Total TTC :", totalsX + 5, curY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(formatCurrency(totals.totalTTC), totalsX + totalsBoxWidth - 5, curY, { align: 'right' });

  // Acompte si existant
  if (downpayment > 0) {
    curY += 6;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.text("Acompte déduit :", totalsX + 5, curY);
    doc.setFont('helvetica', 'bold');
    doc.text(`- ${formatCurrency(downpayment)}`, totalsX + totalsBoxWidth - 5, curY, { align: 'right' });
  }

  // Net à payer (bannière en surbrillance)
  curY += 8;
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(totalsX + 3, curY - 5, totalsBoxWidth - 6, 9, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text("NET À PAYER :", totalsX + 6, curY + 1);
  doc.text(formatCurrency(netToPay), totalsX + totalsBoxWidth - 6, curY + 1, { align: 'right' });

  // 6. Bloc Coordonnées Bancaires & Modalités de règlement (à gauche des totaux)
  const bankBoxWidth = contentWidth - totalsBoxWidth - 8;
  doc.setFillColor(bgCard[0], bgCard[1], bgCard[2]);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(marginX, finalY, bankBoxWidth, downpayment > 0 ? 46 : 38, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("COORDONNÉES BANCAIRES & RÈGLEMENT", marginX + 5, finalY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(`IBAN : ${company.iban || 'FR76 3000 3000 0000 1234 5678 901'}`, marginX + 5, finalY + 12);
  doc.text(`BIC : ${company.bic || 'SOGEFR2N'}`, marginX + 5, finalY + 16.5);
  doc.text(`Conditions : ${data.paymentTerms || "Paiement à 30 jours date d'émission"}`, marginX + 5, finalY + 21);
  doc.text("Règlement par virement bancaire sécurisé en rappelant la référence facture.", marginX + 5, finalY + 25.5);

  // 7. Pied de page légal et pagination
  const footerY = 282;
  doc.setDrawColor(226, 232, 240);
  doc.line(marginX, footerY - 5, pageWidth - marginX, footerY - 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(
    "Dispositions légales : Escompte pour paiement anticipé : néant. En cas de retard de paiement, pénalité au taux légal de la BCE majoré de 10 points,",
    marginX,
    footerY
  );
  doc.text(
    "et indemnité forfaitaire pour frais de recouvrement de 40 € (art. D.441-5 du Code de commerce). Facture conforme format Factur-X / DGFIP.",
    marginX,
    footerY + 3.5
  );

  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(`Page ${i} sur ${pageCount}`, pageWidth - marginX, footerY + 3.5, { align: 'right' });
  }

  return doc;
}

/**
 * Génère le document jsPDF pour un DEVIS / PROPOSITION COMMERCIALE
 */
export function buildQuotePDFDoc(data: QuoteExportData, customCompany?: CompanyInfo): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const company: CompanyInfo = {
    ...DEFAULT_COMPANY,
    ...(customCompany || {}),
    ...(data.company || {})
  };

  const client = data.client || {
    company: data.clientName || "Client Partenaire",
    name: "",
    address: "France",
    email: "",
    phone: ""
  };

  const primaryColor = [15, 23, 42];
  const accentColor = [180, 83, 9];
  const textMuted = [100, 116, 139];
  const bgCard = [248, 250, 252];

  const pageWidth = 210;
  const marginX = 16;
  const contentWidth = pageWidth - (marginX * 2);

  // 1. En-tête
  doc.setFillColor(180, 83, 9);
  doc.rect(0, 0, pageWidth, 5, 'F'); // Ligne dorée supérieure

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(company.name || "MDIV BUSINESS", marginX, 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text("Cabinet d'Ingénierie & Solutions d'Intelligence Artificielle", marginX, 27);
  doc.text(`SIRET : ${company.siret || '981 123 456 00012'} | TVA : ${company.vatNumber || 'FR 32 981123456'}`, marginX, 31.5);
  doc.text(`${company.address || 'Paris, France'} | ${company.email || 'contact@mdiv-business.fr'}`, marginX, 36);

  // Titre Devis à droite
  const headerRightX = pageWidth - marginX;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text("DEVIS COMMERCIAL", headerRightX, 22, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`N° ${data.quoteNumber || 'DEV-2026-001'}`, headerRightX, 28, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(`Date d'émission : ${formatDate(data.date)}`, headerRightX, 34, { align: 'right' });
  doc.text(`Durée de validité : ${data.validityDays || 30} jours`, headerRightX, 39, { align: 'right' });

  // 2. Destinataire
  const clientBoxY = 48;
  doc.setFillColor(bgCard[0], bgCard[1], bgCard[2]);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(headerRightX - 85, clientBoxY, 85, 32, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text("DESTINATAIRE :", headerRightX - 80, clientBoxY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  const clientTitle = client.company || client.name || "Client Partenaire";
  doc.text(clientTitle, headerRightX - 80, clientBoxY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  let lineY = clientBoxY + 17;
  if (client.name && client.name !== clientTitle) {
    doc.text(`À l'attention de : ${client.name}`, headerRightX - 80, lineY);
    lineY += 4.5;
  }
  if (client.address) {
    doc.text(client.address, headerRightX - 80, lineY);
  }

  // 3. Synthèse de l'offre (si existante)
  let tableStartY = 86;
  if (data.executiveSummary) {
    doc.setFillColor(254, 252, 232); // Ambiance or très doux
    doc.setDrawColor(253, 230, 138);
    doc.roundedRect(marginX, 48, contentWidth - 92, 32, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.text("OBJECTIFS & RÉSUMÉ DE L'OFFRE :", marginX + 4, 54);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    const splitSummary = doc.splitTextToSize(data.executiveSummary, contentWidth - 100);
    doc.text(splitSummary.slice(0, 5), marginX + 4, 59);
  }

  // 4. Lignes chiffrées (autoTable)
  const lines = data.lines && data.lines.length > 0 ? data.lines : [
    { description: "Prestation de service sur mesure", quantity: 1, unitPriceHT: 0, vatRate: 20, discountPercentage: 0 }
  ];

  let calculatedHT = 0;
  let calculatedVAT = 0;

  const tableBody = lines.map(line => {
    const qty = Number(line.quantity) || 1;
    const pu = Number(line.unitPriceHT) || 0;
    const vat = Number(line.vatRate) || 20;
    const discount = Number(line.discountPercentage) || 0;

    const baseHT = qty * pu;
    const lineHT = discount > 0 ? baseHT * (1 - discount / 100) : baseHT;
    const lineVAT = lineHT * (vat / 100);

    calculatedHT += lineHT;
    calculatedVAT += lineVAT;

    return [
      line.description || 'Prestation chiffrée',
      qty.toString(),
      formatCurrency(pu),
      `${vat} %`,
      discount > 0 ? `${discount} %` : '-',
      formatCurrency(lineHT)
    ];
  });

  const totals = data.totals || {
    totalHT: calculatedHT,
    totalVAT: calculatedVAT,
    totalTTC: calculatedHT + calculatedVAT
  };

  autoTable(doc, {
    startY: tableStartY,
    head: [['Prestations / Livrables', 'Qté', 'P.U. HT', 'TVA', 'Remise', 'Total HT']],
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [180, 83, 9],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'left',
      cellPadding: 3.5
    },
    columnStyles: {
      0: { cellWidth: 'auto', halign: 'left' },
      1: { cellWidth: 16, halign: 'center' },
      2: { cellWidth: 26, halign: 'right' },
      3: { cellWidth: 18, halign: 'center' },
      4: { cellWidth: 18, halign: 'center' },
      5: { cellWidth: 28, halign: 'right', fontStyle: 'bold' }
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [30, 41, 59],
      cellPadding: 3.5
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    margin: { left: marginX, right: marginX }
  });

  // 5. Totaux & Cadre de signature "Bon pour accord"
  const finalY = (doc as any).lastAutoTable.finalY + 8;
  const totalsBoxWidth = 85;
  const totalsX = pageWidth - marginX - totalsBoxWidth;

  // Totaux
  doc.setFillColor(bgCard[0], bgCard[1], bgCard[2]);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(totalsX, finalY, totalsBoxWidth, 38, 2, 2, 'FD');

  let curY = finalY + 6;
  doc.setFontSize(9);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text("Total HT :", totalsX + 5, curY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(formatCurrency(totals.totalHT), totalsX + totalsBoxWidth - 5, curY, { align: 'right' });

  curY += 6;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text("TVA Estimée :", totalsX + 5, curY);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(totals.totalVAT), totalsX + totalsBoxWidth - 5, curY, { align: 'right' });

  curY += 9;
  doc.setFillColor(180, 83, 9);
  doc.roundedRect(totalsX + 3, curY - 5, totalsBoxWidth - 6, 9, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text("TOTAL ESTIMÉ TTC :", totalsX + 6, curY + 1);
  doc.text(formatCurrency(totals.totalTTC), totalsX + totalsBoxWidth - 6, curY + 1, { align: 'right' });

  // Cadre Signature Client "Bon pour accord"
  const signBoxWidth = contentWidth - totalsBoxWidth - 8;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(marginX, finalY, signBoxWidth, 42, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("BON POUR ACCORD ET COMMANDE", marginX + 5, finalY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text("Mention manuscrite 'Bon pour accord', date et signature du représentant :", marginX + 5, finalY + 11.5);
  doc.text("Date : ____ / ____ / ________", marginX + 5, finalY + 18);
  doc.text("Signature & Cachet commercial :", marginX + 5, finalY + 24);

  // Conditions de paiement sous le cadre
  const termsY = finalY + 46;
  if (data.paymentTerms) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(`Modalités de paiement : ${data.paymentTerms}`, marginX, termsY);
  }

  // Footer
  const footerY = 282;
  doc.setDrawColor(226, 232, 240);
  doc.line(marginX, footerY - 5, pageWidth - marginX, footerY - 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(
    `Devis valable ${data.validityDays || 30} jours à compter de la date d'émission. Pour valider l'offre, veuillez retourner ce document signé et daté.`,
    marginX,
    footerY
  );
  doc.text(
    `${company.name || 'MDIV BUSINESS'} • SIRET ${company.siret || '981 123 456 00012'} • Document édité par la plateforme d'Intelligence Artificielle MDIV.`,
    marginX,
    footerY + 3.5
  );

  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(`Page ${i} sur ${pageCount}`, pageWidth - marginX, footerY + 3.5, { align: 'right' });
  }

  return doc;
}

/**
 * Génère le document jsPDF pour un COMPTE-RENDU DE RÉUNION
 */
export function buildMeetingReportPDFDoc(data: MeetingReportExportData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const marginX = 16;
  const contentWidth = pageWidth - (marginX * 2);

  // En-tête
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text("COMPTE-RENDU DE RÉUNION", marginX, 22);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(180, 83, 9);
  doc.text(data.title || "Réunion Stratégique", marginX, 29);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Date : ${formatDate(data.date)} | MDIV BUSINESS AI Intelligence`, marginX, 35);

  if (data.participants && data.participants.length > 0) {
    doc.text(`Participants : ${data.participants.join(', ')}`, marginX, 40);
  }

  // Synthèse
  let curY = 48;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("1. Synthèse Exécutive", marginX, curY);

  curY += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  const summaryLines = doc.splitTextToSize(data.summary || "Aucun contenu renseigné.", contentWidth);
  doc.text(summaryLines, marginX, curY);
  curY += (summaryLines.length * 4.5) + 8;

  // Décisions clés
  if (data.decisions && data.decisions.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("2. Décisions Stratégiques & Arbitrages", marginX, curY);
    curY += 6;

    data.decisions.forEach((dec) => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(180, 83, 9);
      doc.text("✓", marginX + 2, curY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      const decLines = doc.splitTextToSize(dec, contentWidth - 8);
      doc.text(decLines, marginX + 8, curY);
      curY += (decLines.length * 4.5) + 2;
    });
    curY += 6;
  }

  // Plan d'action (Tableau)
  if (data.actionItems && data.actionItems.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("3. Plan d'Action & Engagements", marginX, curY);

    const actionBody = data.actionItems.map(item => [
      item.task || '',
      item.assignee || 'Équipe',
      item.deadline || '-',
      item.priority || 'Normal'
    ]);

    autoTable(doc, {
      startY: curY + 3,
      head: [['Action / Livrable', 'Responsable', 'Échéance', 'Priorité']],
      body: actionBody,
      theme: 'grid',
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5
      },
      styles: { fontSize: 8.5, cellPadding: 3 },
      margin: { left: marginX, right: marginX }
    });
  }

  return doc;
}

/**
 * Génère le document jsPDF pour une SYNTHÈSE DE DOCUMENT IA
 */
export function buildDocumentSummaryPDFDoc(data: DocumentSummaryExportData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const marginX = 16;
  const contentWidth = pageWidth - (marginX * 2);

  // En-tête
  doc.setFillColor(37, 99, 235); // Blue-600
  doc.rect(0, 0, pageWidth, 5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text("SYNTHÈSE DE DOCUMENT IA", marginX, 22);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(37, 99, 235);
  doc.text(data.documentName || "Document Analysé", marginX, 29);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Analyse effectuée le ${formatDate(data.analysisDate)} • Mode : ${data.mode || 'Standard'}`, marginX, 35);

  // KPIs
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(marginX, 40, contentWidth, 14, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`LISIBILITÉ : ${data.readabilityScore || 85}/100`, marginX + 6, 48);
  doc.text(`PAGES ANALYSÉES : ${data.pageCount || 1}`, marginX + 65, 48);
  doc.text(`TEMPS ÉCONOMISÉ : ${data.timeSavedMinutes || 25} min`, marginX + 130, 48);

  // Résumé
  let curY = 62;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("Synthèse Exécutive", marginX, curY);

  curY += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  const summaryLines = doc.splitTextToSize(data.executiveSummary, contentWidth);
  doc.text(summaryLines, marginX, curY);
  curY += (summaryLines.length * 4.5) + 8;

  // Points clés
  if (data.keyTakeaways && data.keyTakeaways.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("Points Clés & Enseignements", marginX, curY);
    curY += 6;

    data.keyTakeaways.forEach((point) => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text("•", marginX + 2, curY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      const pointLines = doc.splitTextToSize(point, contentWidth - 8);
      doc.text(pointLines, marginX + 8, curY);
      curY += (pointLines.length * 4.5) + 2;
    });
  }

  return doc;
}

// ==========================================
// FONCTIONS DE TÉLÉCHARGEMENT DIRECT BINAIRE
// ==========================================

/**
 * Télécharge directement le PDF d'une facture sous forme de fichier binaire (.pdf).
 */
export async function downloadInvoicePDF(data: InvoiceExportData, customCompany?: CompanyInfo): Promise<void> {
  const doc = buildInvoicePDFDoc(data, customCompany);
  const fileName = `Facture-${data.invoiceNumber || new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
}

/**
 * Télécharge directement le PDF d'un devis sous forme de fichier binaire (.pdf).
 */
export async function downloadQuotePDF(data: QuoteExportData, customCompany?: CompanyInfo): Promise<void> {
  const doc = buildQuotePDFDoc(data, customCompany);
  const fileName = `Devis-${data.quoteNumber || new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
}

/**
 * Télécharge directement le PDF d'un compte-rendu de réunion.
 */
export async function downloadMeetingReportPDF(data: MeetingReportExportData): Promise<void> {
  const doc = buildMeetingReportPDFDoc(data);
  const safeTitle = (data.title || 'reunion').toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30);
  const fileName = `Compte-Rendu-${safeTitle}.pdf`;
  doc.save(fileName);
}

/**
 * Télécharge directement le PDF d'une synthèse de document.
 */
export async function downloadDocumentSummaryPDF(data: DocumentSummaryExportData): Promise<void> {
  const doc = buildDocumentSummaryPDFDoc(data);
  const safeTitle = (data.documentName || 'document').toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30);
  const fileName = `Synthese-${safeTitle}.pdf`;
  doc.save(fileName);
}

// ==========================================
// FONCTIONS DE PRÉVISUALISATION (BLOB URL)
// ==========================================

export function getInvoicePDFBlob(data: InvoiceExportData, customCompany?: CompanyInfo): { blob: Blob; url: string; fileName: string } {
  const doc = buildInvoicePDFDoc(data, customCompany);
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  const fileName = `Facture-${data.invoiceNumber || 'preview'}.pdf`;
  return { blob, url, fileName };
}

export function getQuotePDFBlob(data: QuoteExportData, customCompany?: CompanyInfo): { blob: Blob; url: string; fileName: string } {
  const doc = buildQuotePDFDoc(data, customCompany);
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  const fileName = `Devis-${data.quoteNumber || 'preview'}.pdf`;
  return { blob, url, fileName };
}
