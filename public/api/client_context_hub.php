<?php
/**
 * API client_context_hub.php - Hub central d'interconnexion 360° et délibération client
 * MDIV Business Platform
 */
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Dev DB fallback pour environnement local sans PDO MySQL
$dbPath = __DIR__ . '/../../dev_db.json';
function getDevData($path) {
    if (file_exists($path)) {
        return json_decode(file_get_contents($path), true) ?: [];
    }
    return [];
}

function saveDevData($path, $data) {
    file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

$action = $_GET['action'] ?? '';
$input = json_decode(file_get_contents('php://input'), true) ?: [];

// Résolution de l'action si passée dans le corps
if (empty($action) && isset($input['action'])) {
    $action = $input['action'];
}

$companyId = (int)($_GET['company_id'] ?? ($input['company_id'] ?? 1));
$clientId = (int)($_GET['client_id'] ?? ($input['client_id'] ?? 0));

try {
    $pdo = get_db_connection();
} catch (Exception $e) {
    $pdo = null;
}

switch ($action) {
    // -------------------------------------------------------------
    // 1. GET_CLIENT_360 : Récupère la vision 360° complète du client
    // -------------------------------------------------------------
    case 'get_client_360':
        if ($clientId <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'client_id requis']);
            exit;
        }

        $clientData = null;
        $interactions = [];
        $quotes = [];
        $invoices = [];
        $savedWorks = [];

        if ($pdo) {
            // Client
            $stmt = $pdo->prepare("SELECT * FROM clients WHERE id = ? AND company_id = ?");
            $stmt->execute([$clientId, $companyId]);
            $clientData = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($clientData) {
                // Interactions
                $stmt = $pdo->prepare("SELECT * FROM client_interactions WHERE client_id = ? AND company_id = ? ORDER BY id DESC LIMIT 15");
                $stmt->execute([$clientId, $companyId]);
                $interactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

                // Devis
                $stmt = $pdo->prepare("SELECT id, quote_number, status, total_ht, total_ttc, payment_terms, created_at FROM quotes WHERE client_id = ? AND company_id = ? ORDER BY id DESC LIMIT 10");
                $stmt->execute([$clientId, $companyId]);
                $quotes = $stmt->fetchAll(PDO::FETCH_ASSOC);

                // Factures
                $stmt = $pdo->prepare("SELECT id, invoice_number, status, amount_ht, amount_ttc, due_date, created_at FROM invoices WHERE client_id = ? AND company_id = ? ORDER BY id DESC LIMIT 10");
                $stmt->execute([$clientId, $companyId]);
                $invoices = $stmt->fetchAll(PDO::FETCH_ASSOC);
            }
        } else {
            // Mode mock / dev_db.json
            $dev = getDevData($dbPath);
            $clients = $dev['clients'] ?? [];
            foreach ($clients as $c) {
                if ((int)$c['id'] === $clientId) {
                    $clientData = $c;
                    break;
                }
            }
            if (!$clientData) {
                // Créer un mock par défaut si introuvable en dev
                $clientData = [
                    'id' => $clientId,
                    'company_id' => $companyId,
                    'name' => 'Client Partenaire Démo',
                    'company' => 'Industries & Co',
                    'email' => 'contact@industries-co.fr',
                    'phone' => '04 78 00 00 00',
                    'address' => '12 Rue de l\'Industrie, 69000 Lyon',
                    'notes' => 'Client prioritaire avec accords cadres'
                ];
            }
            $interactions = array_values(array_filter($dev['client_interactions'] ?? [], function($i) use ($clientId) {
                return (int)($i['client_id'] ?? 0) === $clientId;
            }));
            $quotes = array_values(array_filter($dev['quotes'] ?? [], function($q) use ($clientId) {
                return (int)($q['client_id'] ?? 0) === $clientId;
            }));
            $invoices = array_values(array_filter($dev['invoices'] ?? [], function($inv) use ($clientId) {
                return (int)($inv['client_id'] ?? 0) === $clientId;
            }));
        }

        if (!$clientData) {
            http_response_code(404);
            echo json_encode(['error' => 'Client introuvable']);
            exit;
        }

        // Synthèse exécutive du profil client
        $pendingQuotesCount = 0;
        $overdueInvoicesCount = 0;
        $totalOverdueAmount = 0.0;

        foreach ($quotes as $q) {
            if (in_array($q['status'] ?? '', ['draft', 'sent', 'pending'])) {
                $pendingQuotesCount++;
            }
        }
        $today = date('Y-m-d');
        foreach ($invoices as $inv) {
            if (($inv['status'] ?? '') === 'overdue' || (($inv['status'] ?? '') === 'pending' && ($inv['due_date'] ?? '9999') < $today)) {
                $overdueInvoicesCount++;
                $totalOverdueAmount += (float)($inv['amount_ttc'] ?? 0);
            }
        }

        $summary = "Client " . ($clientData['company'] ?: $clientData['name']) . ". ";
        if ($pendingQuotesCount > 0) {
            $summary .= "{$pendingQuotesCount} devis en cours d'arbitrage. ";
        }
        if ($overdueInvoicesCount > 0) {
            $summary .= "ATTENTION : {$overdueInvoicesCount} facture(s) en retard (Total: " . number_format($totalOverdueAmount, 2, ',', ' ') . " € TTC). ";
        } else {
            $summary .= "Situation comptable saine, aucun arriéré. ";
        }

        echo json_encode([
            'success' => true,
            'client' => $clientData,
            'interactions' => $interactions,
            'quotes' => $quotes,
            'invoices' => $invoices,
            'financial_summary' => [
                'pending_quotes_count' => $pendingQuotesCount,
                'overdue_invoices_count' => $overdueInvoicesCount,
                'total_overdue_amount' => $totalOverdueAmount
            ],
            'executive_context' => $summary
        ]);
        break;

    // -------------------------------------------------------------
    // 2. SAVE_INTERACTION : Enregistre un échange omnicanal
    // -------------------------------------------------------------
    case 'save_interaction':
        if ($clientId <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'client_id requis']);
            exit;
        }

        $direction = $input['direction'] ?? 'inbound';
        $channel = $input['channel'] ?? 'email';
        $subject = trim($input['subject'] ?? 'Échange sans objet');
        $bodyText = trim($input['body_text'] ?? '');
        $summary = trim($input['summary'] ?? (mb_substr($bodyText, 0, 150) . '...'));
        $sentiment = $input['sentiment'] ?? 'neutral';
        $referenceId = $input['reference_id'] ?? null;
        $metaJson = isset($input['metadata']) ? json_encode($input['metadata']) : null;

        if (empty($bodyText)) {
            http_response_code(400);
            echo json_encode(['error' => 'Le contenu du message (body_text) est obligatoire.']);
            exit;
        }

        $interactionId = 0;
        if ($pdo) {
            $stmt = $pdo->prepare("
                INSERT INTO client_interactions (company_id, client_id, direction, channel, subject, body_text, summary, sentiment, metadata_json, reference_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([$companyId, $clientId, $direction, $channel, $subject, $bodyText, $summary, $sentiment, $metaJson, $referenceId]);
            $interactionId = (int)$pdo->lastInsertId();
        } else {
            $dev = getDevData($dbPath);
            $interactionId = time();
            $newInter = [
                'id' => $interactionId,
                'company_id' => $companyId,
                'client_id' => $clientId,
                'direction' => $direction,
                'channel' => $channel,
                'subject' => $subject,
                'body_text' => $bodyText,
                'summary' => $summary,
                'sentiment' => $sentiment,
                'reference_id' => $referenceId,
                'created_at' => date('Y-m-d H:i:s')
            ];
            $dev['client_interactions'] = array_merge([$newInter], $dev['client_interactions'] ?? []);
            saveDevData($dbPath, $dev);
        }

        echo json_encode([
            'success' => true,
            'interaction_id' => $interactionId,
            'message' => 'Interaction client consignée avec succès.'
        ]);
        break;

    // -------------------------------------------------------------
    // 3. CONTEXTUAL_EMAIL_REPLY : Réponse intelligente contextualisée
    // -------------------------------------------------------------
    case 'contextual_email_reply':
        $incomingText = trim($input['incoming_email_text'] ?? '');
        $tone = $input['tone'] ?? 'Professionnel';
        $objective = $input['objective'] ?? 'Réponse stratégique';
        $customPrompt = $input['custom_instructions'] ?? '';

        if (empty($incomingText)) {
            http_response_code(400);
            echo json_encode(['error' => 'Le texte de l\'email entrant est obligatoire.']);
            exit;
        }

        // Récupération du contexte client 360
        $clientName = 'Client';
        $clientCompany = '';
        $financialState = '';
        $pastExchanges = '';

        if ($clientId > 0) {
            if ($pdo) {
                $stmt = $pdo->prepare("SELECT name, company, email FROM clients WHERE id = ? AND company_id = ?");
                $stmt->execute([$clientId, $companyId]);
                $c = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($c) {
                    $clientName = $c['name'];
                    $clientCompany = $c['company'];
                }

                // Factures en retard
                $stmt = $pdo->prepare("SELECT invoice_number, amount_ttc, due_date FROM invoices WHERE client_id = ? AND company_id = ? AND status = 'overdue' LIMIT 3");
                $stmt->execute([$clientId, $companyId]);
                $overdue = $stmt->fetchAll(PDO::FETCH_ASSOC);
                if (!empty($overdue)) {
                    $financialState .= "ATTENTION : Factures en retard détectées : ";
                    foreach ($overdue as $inv) {
                        $financialState .= "{$inv['invoice_number']} ({$inv['amount_ttc']} € due le {$inv['due_date']}), ";
                    }
                }

                // Devis récents
                $stmt = $pdo->prepare("SELECT quote_number, total_ttc, status FROM quotes WHERE client_id = ? AND company_id = ? ORDER BY id DESC LIMIT 2");
                $stmt->execute([$clientId, $companyId]);
                $recentQ = $stmt->fetchAll(PDO::FETCH_ASSOC);
                if (!empty($recentQ)) {
                    $financialState .= "Devis récents : ";
                    foreach ($recentQ as $q) {
                        $financialState .= "{$q['quote_number']} ({$q['total_ttc']} € - {$q['status']}), ";
                    }
                }
            } else {
                $dev = getDevData($dbPath);
                foreach ($dev['clients'] ?? [] as $c) {
                    if ((int)$c['id'] === $clientId) {
                        $clientName = $c['name'];
                        $clientCompany = $c['company'] ?? '';
                    }
                }
            }
        }

        // Construction du System Prompt enrichi
        $systemPrompt = "Tu es l'assistant exécutif IA de l'entreprise MDIV Business.
Ta mission est de rédiger une réponse d'email professionnelle, percutante et hautement contextualisée à l'email reçu d'un client.

INFORMATIONS CLIENT :
- Nom de l'interlocuteur : {$clientName}
- Entreprise cliente : {$clientCompany}
- Contexte financier & contractuel : " . ($financialState ?: "Aucun litige, relation saine.") . "

DIRECTIVES DE RÉDACTION :
- Ton exigé : {$tone}
- Objectif de l'email : {$objective}
" . (!empty($customPrompt) ? "- Consignes spécifiques : {$customPrompt}\n" : "") . "
RÈGLES STRICTES :
1. Saluer poliment et répondre point par point aux interrogations ou demandes soulevées dans le mail reçu.
2. Si une facture est en retard et que l'utilisateur n'a pas demandé d'ignorer le financier, mentionner délicatement ou fermement (selon le ton) la régularisation de l'arriéré.
3. Conserver une clarté absolue, une orthographe irréprochable et inclure une formule de politesse finale chaleureuse et professionnelle.
4. Renvoyer uniquement le corps de l'email prêt à être copié/envoyé, sans méta-commentaires.";

        $userPrompt = "VOICI L'EMAIL REÇU DU CLIENT :\n\"\"\"\n{$incomingText}\n\"\"\"\n\nRédige la réponse optimale en respectant les consignes.";

        $apiKey = getenv('OPENAI_API_KEY') ?: ($_ENV['OPENAI_API_KEY'] ?? ($_SERVER['OPENAI_API_KEY'] ?? ''));
        $generatedReply = "";

        if (!empty($apiKey)) {
            $ch = curl_init('https://api.openai.com/v1/chat/completions');
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $apiKey
            ]);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
                'model' => 'gpt-4o-mini',
                'temperature' => 0.4,
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => $userPrompt]
                ]
            ]));
            $res = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode === 200) {
                $decoded = json_decode($res, true);
                $generatedReply = $decoded['choices'][0]['message']['content'] ?? '';
            }
        }

        // Repli déterministe enrichi si API indisponible
        if (empty($generatedReply)) {
            $greeting = !empty($clientName) ? "Bonjour {$clientName}," : "Bonjour,";
            $generatedReply = "{$greeting}\n\nJ'ai bien pris connaissance de votre message et je vous remercie pour ces éléments.\n\n";
            $generatedReply .= "Concernant vos remarques, nous avons soigneusement examiné les points soulevés dans votre email afin d'y apporter la réponse la plus adaptée.\n\n";
            if (!empty($financialState) && strpos($financialState, 'ATTENTION') !== false) {
                $generatedReply .= "Par ailleurs, nous profitons de cet échange pour vous rappeler qu'un règlement est actuellement en attente sur votre compte. Nous vous saurions gré de bien vouloir en faciliter le traitement auprès de votre service comptabilité.\n\n";
            }
            $generatedReply .= "Je reste à votre entière disposition pour tout échange complémentaire ou pour caler un point d'étape selon vos disponibilités.\n\nBien cordialement,\nL'équipe de Direction";
        }

        // Enregistrement automatique de la réponse dans les interactions
        if ($clientId > 0) {
            $autoInterId = 0;
            if ($pdo) {
                $stmt = $pdo->prepare("
                    INSERT INTO client_interactions (company_id, client_id, direction, channel, subject, body_text, summary, sentiment)
                    VALUES (?, ?, 'outbound', 'email', 'Réponse générée par IA', ?, 'Brouillon de réponse contextualisée', 'positive')
                ");
                $stmt->execute([$companyId, $clientId, $generatedReply]);
            }
        }

        echo json_encode([
            'success' => true,
            'reply_text' => $generatedReply,
            'context_summary' => [
                'client_name' => $clientName,
                'client_company' => $clientCompany,
                'tone_applied' => $tone,
                'financial_alert' => !empty($financialState)
            ]
        ]);
        break;

    // -------------------------------------------------------------
    // 4. BIND_MODULES : Lie deux objets métier entre applications
    // -------------------------------------------------------------
    case 'bind_modules':
        $sourceModule = $input['source_module'] ?? '';
        $sourceId = (string)($input['source_id'] ?? '');
        $targetModule = $input['target_module'] ?? '';
        $targetId = (string)($input['target_id'] ?? '');
        $linkType = $input['link_type'] ?? 'referenced_by';

        if (empty($sourceModule) || empty($sourceId) || empty($targetModule) || empty($targetId)) {
            http_response_code(400);
            echo json_encode(['error' => 'Tous les paramètres de liaison sont obligatoires']);
            exit;
        }

        $linkId = 0;
        if ($pdo) {
            $stmt = $pdo->prepare("
                INSERT INTO cross_module_bindings (company_id, client_id, source_module, source_id, target_module, target_id, link_type)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([$companyId, $clientId, $sourceModule, $sourceId, $targetModule, $targetId, $linkType]);
            $linkId = (int)$pdo->lastInsertId();
        } else {
            $dev = getDevData($dbPath);
            $linkId = time();
            $newBinding = [
                'id' => $linkId,
                'company_id' => $companyId,
                'client_id' => $clientId,
                'source_module' => $sourceModule,
                'source_id' => $sourceId,
                'target_module' => $targetModule,
                'target_id' => $targetId,
                'link_type' => $linkType,
                'created_at' => date('Y-m-d H:i:s')
            ];
            $dev['cross_module_bindings'] = array_merge([$newBinding], $dev['cross_module_bindings'] ?? []);
            saveDevData($dbPath, $dev);
        }

        echo json_encode([
            'success' => true,
            'link_id' => $linkId,
            'message' => "Liaison créée entre {$sourceModule}:{$sourceId} et {$targetModule}:{$targetId}"
        ]);
        break;

    default:
        http_response_code(400);
        echo json_encode(['error' => "Action '{$action}' inconnue."]);
        break;
}
