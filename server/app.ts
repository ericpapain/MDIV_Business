import type http from 'http';
import type { RequestContext } from './shared/types/http.types';
import { parseRequestBody } from './shared/utils/body-parser.utils';
import { authController } from './modules/auth/auth.controller';
import { companyController } from './modules/companies/company.controller';
import { appointmentController } from './modules/appointments/appointment.controller';
import { customerController } from './modules/customers/customer.controller';
import { quoteController } from './modules/quotes/quote.controller';
import { invoiceController } from './modules/invoices/invoice.controller';
import { expenseController } from './modules/expenses/expense.controller';
import { fintechController } from './modules/fintech/fintech.controller';
import { diagnosticController } from './modules/diagnostic/diagnostic.controller';
import { meetingController } from './modules/meetings/meeting.controller';
import { prospectingController } from './modules/prospecting/prospecting.controller';
import { ragController } from './modules/rag/rag.controller';
import { aiGovernanceController } from './modules/ai-governance/ai-governance.controller';
import { cmsController } from './modules/cms-public/cms.controller';
import { personaController } from './modules/persona/persona.controller';
import { eventController } from './modules/events/event.controller';
import { extractToken, verifyToken } from './shared/middleware/auth.middleware';

export async function dispatchDevApi(req: http.IncomingMessage, res: http.ServerResponse): Promise<boolean> {
  const urlObj = new URL(req.url || '/', 'http://localhost:8080');
  const pathname = urlObj.pathname;

  // Only handle API endpoints
  if (!pathname.startsWith('/api/') && !pathname.startsWith('/api-')) {
    return false;
  }

  if (req.method === 'OPTIONS') {
    return true;
  }

  // Extract Company Context with Bearer Token fallback
  const authToken = extractToken(req, urlObj);
  const session = verifyToken(authToken);
  const companyIdParam = urlObj.searchParams.get('company_id');
  const companyId = companyIdParam ? parseInt(companyIdParam, 10) : (session?.companyId || 1);

  const ctx: RequestContext = {
    req,
    res,
    urlObj,
    pathname,
    method: (req.method || 'GET').toUpperCase() as any,
    companyId,
  };

  const parsed = await parseRequestBody(req);

  // 1. Auth & Identity
  if (pathname === '/api-auth.php') {
    await authController.handleLegacyAuth(ctx);
    return true;
  }
  if (pathname === '/api/auth/login.php') {
    await authController.handleLogin(ctx, parsed);
    return true;
  }
  if (pathname === '/api/auth/google_auth.php') {
    await authController.handleGoogleAuth(ctx, parsed);
    return true;
  }
  if (pathname === '/api/auth/register.php') {
    await authController.handleRegister(ctx, parsed);
    return true;
  }

  // 2. Company & Search & Persona
  if (pathname === '/api/persona.php') {
    await personaController.handlePersona(ctx, parsed);
    return true;
  }
  if (pathname === '/api/company_profile.php' || pathname === '/api/company_settings.php') {
    await companyController.handleProfile(ctx, parsed);
    return true;
  }
  if (pathname === '/api/company_search.php' || pathname === '/api/company/search') {
    await companyController.handleSearch(ctx);
    return true;
  }

  // 3. Appointments & Online Booking 24/7
  if (pathname === '/api/appointments.php') {
    await appointmentController.handleAppointments(ctx, parsed);
    return true;
  }
  if (pathname === '/api/appointment_settings.php') {
    await appointmentController.handleSettings(ctx, parsed);
    return true;
  }
  if (pathname === '/api/booking_links.php') {
    await appointmentController.handleBookingLinks(ctx, parsed);
    return true;
  }
  if (pathname === '/api/appointment_notifications.php') {
    await appointmentController.handleNotifications(ctx, parsed);
    return true;
  }

  // 4. Customers & CRM 360
  if (pathname === '/api/clients.php') {
    await customerController.handleClients(ctx, parsed);
    return true;
  }
  if (pathname.endsWith('/client_context_hub.php')) {
    await customerController.handleContextHub(ctx, parsed);
    return true;
  }

  // 5. Quotes & Projects
  if (pathname === '/api/quotes.php') {
    await quoteController.handleQuotes(ctx, parsed);
    return true;
  }
  if (pathname === '/api/projects.php') {
    await quoteController.handleProjects(ctx, parsed);
    return true;
  }
  if (pathname === '/api/quote_ai_assist.php') {
    await quoteController.handleAiAssist(ctx, parsed);
    return true;
  }

  // 6. Invoices, KPIs, Factur-X & PPF
  if (pathname === '/api/invoices.php') {
    await invoiceController.handleInvoices(ctx, parsed);
    return true;
  }
  if (pathname === '/api/invoices_kpis.php') {
    await invoiceController.handleKpis(ctx);
    return true;
  }
  if (pathname === '/api/invoice_ai_check.php') {
    await invoiceController.handleAiCheck(ctx, parsed);
    return true;
  }
  if (pathname === '/api/facturx_generator.php') {
    await invoiceController.handleFacturXGenerator(ctx, parsed);
    return true;
  }
  if (pathname === '/api/ppf/verify_directory.php') {
    await invoiceController.handlePpfVerify(ctx, parsed);
    return true;
  }
  if (pathname === '/api/ppf/deposit.php') {
    await invoiceController.handlePpfDeposit(ctx, parsed);
    return true;
  }

  // 7. Expenses & OCR Vision
  if (pathname === '/api/expenses.php') {
    await expenseController.handleExpenses(ctx, parsed);
    return true;
  }
  if (pathname === '/api/invoice_extract_lines.php') {
    await expenseController.handleExtractLines(ctx, parsed);
    return true;
  }
  if (pathname === '/api/ocr_vision_parse.php') {
    await expenseController.handleOcrVisionParse(ctx, parsed);
    return true;
  }
  if (pathname.endsWith('ocr_document_vision.php')) {
    await expenseController.handleOcrDocumentVision(ctx, parsed);
    return true;
  }

  // 8. Fintech (SEPA, Rapprochement bancaire, FEC)
  if (pathname === '/api/sepa_payment.php') {
    await fintechController.handleSepaPayment(ctx, parsed);
    return true;
  }
  if (pathname === '/api/bank_reconciliation.php') {
    await fintechController.handleBankReconciliation(ctx, parsed);
    return true;
  }
  if (pathname === '/api/fec_export.php') {
    await fintechController.handleFecExport(ctx);
    return true;
  }

  // 9. Diagnostic Express & Deep Dive
  if (pathname === '/api/diagnostic_step.php') {
    await diagnosticController.handleStep(ctx, parsed);
    return true;
  }
  if (pathname === '/api/diagnostic_agents.php') {
    await diagnosticController.handleAgents(ctx, parsed);
    return true;
  }
  if (pathname === '/api/deep_dive.php') {
    await diagnosticController.handleDeepDive(ctx, parsed);
    return true;
  }

  // 10. Meetings & Document Summarizer
  if (pathname === '/api/classify_document.php') {
    await meetingController.handleClassify(ctx, parsed);
    return true;
  }
  if (pathname === '/api/summarizer_upload.php') {
    await meetingController.handleSummarizerUpload(ctx, parsed);
    return true;
  }
  if (pathname === '/api/summarizer_agents.php') {
    await meetingController.handleSummarizerAgents(ctx, parsed);
    return true;
  }
  if (pathname === '/api/meeting_upload.php') {
    await meetingController.handleMeetingUpload(ctx, parsed);
    return true;
  }
  if (pathname === '/api/meeting_agents.php') {
    await meetingController.handleMeetingAgents(ctx, parsed);
    return true;
  }
  if (pathname === '/api/meeting_prep_generate.php') {
    await meetingController.handleMeetingPrep(ctx, parsed);
    return true;
  }
  if (pathname === '/api/upcoming_meetings.php') {
    await meetingController.handleUpcomingMeetings(ctx);
    return true;
  }

  // 11. Prospecting, Leads & Followup
  if (pathname === '/api/leads_kpis.php') {
    await prospectingController.handleLeadsKpis(ctx);
    return true;
  }
  if (pathname === '/api/leads_search.php') {
    await prospectingController.handleLeadsSearch(ctx, parsed);
    return true;
  }
  if (pathname === '/api/prospecting_generate.php') {
    await prospectingController.handleProspectingGenerate(ctx, parsed);
    return true;
  }
  if (pathname === '/api/tenders_search.php') {
    await prospectingController.handleTendersSearch(ctx, parsed);
    return true;
  }
  if (pathname === '/api/email_generate.php') {
    await prospectingController.handleEmailGenerate(ctx, parsed);
    return true;
  }
  if (pathname === '/api/email_analyze.php') {
    await prospectingController.handleEmailAnalyze(ctx, parsed);
    return true;
  }
  if (pathname === '/api/followup_targets.php') {
    await prospectingController.handleFollowupTargets(ctx);
    return true;
  }
  if (pathname === '/api/followup_kpis.php') {
    await prospectingController.handleFollowupKpis(ctx);
    return true;
  }
  if (pathname === '/api/followup_generate.php') {
    await prospectingController.handleFollowupGenerate(ctx, parsed);
    return true;
  }
  if (pathname === '/api/followup_send.php') {
    await prospectingController.handleFollowupSend(ctx, parsed);
    return true;
  }
  if (pathname === '/api/content_generate.php') {
    await prospectingController.handleContentGenerate(ctx, parsed);
    return true;
  }
  if (pathname === '/api/content_brand_settings.php') {
    await prospectingController.handleContentBrandSettings(ctx, parsed);
    return true;
  }
  if (pathname === '/api/content_kpis.php') {
    await prospectingController.handleContentKpis(ctx);
    return true;
  }
  if (pathname === '/api/content_history.php') {
    await prospectingController.handleContentHistory(ctx);
    return true;
  }
  if (pathname === '/api/content_export.php') {
    await prospectingController.handleContentExport(ctx, parsed);
    return true;
  }

  // 12. RAG & Knowledge
  if (pathname.endsWith('/rag_document_indexer.php')) {
    await ragController.handleIndex(ctx, parsed);
    return true;
  }
  if (pathname.endsWith('/rag_query.php')) {
    await ragController.handleQuery(ctx, parsed);
    return true;
  }
  if (pathname.endsWith('/feedback_loop.php')) {
    await ragController.handleFeedback(ctx, parsed);
    return true;
  }

  // 13. AI Governance & Telemetry
  if (pathname === '/api/ai_settings.php') {
    await aiGovernanceController.handleSettings(ctx, parsed);
    return true;
  }
  if (pathname === '/api/ai_test_provider.php') {
    await aiGovernanceController.handleTestProvider(ctx, parsed);
    return true;
  }
  if (pathname.endsWith('/ai_telemetry.php')) {
    await aiGovernanceController.handleTelemetry(ctx);
    return true;
  }

  // 14. CMS & Saved Work
  if (pathname === '/api/saved_work.php') {
    await cmsController.handleSavedWork(ctx, parsed);
    return true;
  }
  if (pathname === '/api/benchmark_stats.php') {
    await cmsController.handleBenchmarkStats(ctx);
    return true;
  }
  if (pathname === '/api/benchmark_submit.php') {
    await cmsController.handleBenchmarkSubmit(ctx);
    return true;
  }

  // 15. MDIV EVENT ENGINE (Événements, Inscriptions & CRM Sync)
  if (pathname === '/api-public.php') {
    const action = urlObj.searchParams.get('action');
    if (action === 'events') {
      await eventController.handlePublicEvents(ctx);
      return true;
    }
  }

  if (pathname === '/api-admin.php') {
    const action = urlObj.searchParams.get('action');
    if (action === 'events' || action === 'add_event' || action === 'edit_event' || action === 'delete_event') {
      await eventController.handleAdminEvents(ctx, parsed);
      return true;
    }
  }

  if (pathname === '/api/event_engine.php') {
    await eventController.handleEventEngine(ctx, parsed);
    return true;
  }

  return false;
}
