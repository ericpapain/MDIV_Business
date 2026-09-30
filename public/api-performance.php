<?php
// public/api-performance.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'api-config.php';
session_start();

// Protection par la session administrateur existante
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Non autorisé']);
    exit();
}

$action = isset($_GET['action']) ? $_GET['action'] : '';
$data = json_decode(file_get_contents("php://input"));

// ─── 1. CRÉATION DES TABLES NORMALISÉES ─────────────────────────────────────

// Table Relations (Clients, Ambassadeurs, Apporteurs, Partenaires, Prospects)
$pdo->exec("CREATE TABLE IF NOT EXISTS perf_relationships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) DEFAULT '',
    company VARCHAR(255) DEFAULT '',
    role VARCHAR(255) DEFAULT '',
    type ENUM('client', 'ambassador', 'business_referrer', 'partner', 'prospect', 'prescriber', 'other') NOT NULL DEFAULT 'prospect',
    status ENUM('prospect', 'contacted', 'discussion', 'active', 'inactive', 'completed') NOT NULL DEFAULT 'active',
    email VARCHAR(255) DEFAULT '',
    phone VARCHAR(50) DEFAULT '',
    website VARCHAR(500) DEFAULT '',
    linkedin VARCHAR(500) DEFAULT '',
    instagram VARCHAR(500) DEFAULT '',
    facebook VARCHAR(500) DEFAULT '',
    address TEXT DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    start_date DATE DEFAULT NULL,
    source VARCHAR(255) DEFAULT '',
    manager VARCHAR(255) DEFAULT '',
    relation_level VARCHAR(100) DEFAULT '',
    last_contact_date DATE DEFAULT NULL,
    next_contact_date DATE DEFAULT NULL,
    next_action VARCHAR(500) DEFAULT '',
    comments TEXT DEFAULT NULL,
    contract_details JSON DEFAULT NULL,
    ambassador_metrics JSON DEFAULT NULL,
    referrer_metrics JSON DEFAULT NULL,
    leads_generated INT DEFAULT 0,
    qualified_contacts INT DEFAULT 0,
    projects_count INT DEFAULT 0,
    conversions_count INT DEFAULT 0,
    revenue_generated DECIMAL(12,2) DEFAULT 0.00,
    potential_revenue DECIMAL(12,2) DEFAULT 0.00,
    actions_count INT DEFAULT 0,
    events_count INT DEFAULT 0,
    recommendations_count INT DEFAULT 0,
    is_demo TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

// Table Projets
$pdo->exec("CREATE TABLE IF NOT EXISTS perf_projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    relation_id INT NOT NULL,
    manager VARCHAR(255) DEFAULT '',
    type VARCHAR(100) DEFAULT 'Projet Web / Marketing',
    start_date DATE DEFAULT NULL,
    target_end_date DATE DEFAULT NULL,
    actual_end_date DATE DEFAULT NULL,
    budget DECIMAL(12,2) DEFAULT 0.00,
    expected_revenue DECIMAL(12,2) DEFAULT 0.00,
    actual_revenue DECIMAL(12,2) DEFAULT 0.00,
    status ENUM('idea', 'prospect', 'qualifying', 'planned', 'in_progress', 'waiting', 'blocked', 'completed', 'cancelled') DEFAULT 'in_progress',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    progress_percent INT DEFAULT 0,
    objectives TEXT DEFAULT NULL,
    risks TEXT DEFAULT NULL,
    blockers TEXT DEFAULT NULL,
    next_actions TEXT DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    is_demo TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

// Table KPIs configurables
$pdo->exec("CREATE TABLE IF NOT EXISTS perf_kpis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'general',
    unit VARCHAR(50) NOT NULL DEFAULT 'number',
    source VARCHAR(255) DEFAULT '',
    frequency VARCHAR(50) DEFAULT 'mensuel',
    current_value DECIMAL(12,2) DEFAULT 0.00,
    target_value DECIMAL(12,2) DEFAULT 0.00,
    period VARCHAR(100) DEFAULT 'En cours',
    manager VARCHAR(255) DEFAULT '',
    status ENUM('on_track', 'warning', 'critical', 'completed') DEFAULT 'on_track',
    calc_method VARCHAR(255) DEFAULT '',
    last_updated DATE DEFAULT NULL,
    is_contractual TINYINT(1) DEFAULT 0,
    relation_id INT DEFAULT NULL,
    project_id INT DEFAULT NULL,
    is_demo TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

// Table Campagnes
$pdo->exec("CREATE TABLE IF NOT EXISTS perf_campaigns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    relation_id INT NOT NULL,
    channel VARCHAR(100) NOT NULL DEFAULT 'google_ads',
    objective VARCHAR(255) DEFAULT '',
    budget DECIMAL(12,2) DEFAULT 0.00,
    client_funded TINYINT(1) DEFAULT 0,
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL,
    content_details TEXT DEFAULT NULL,
    impressions INT DEFAULT 0,
    views INT DEFAULT 0,
    clicks INT DEFAULT 0,
    leads INT DEFAULT 0,
    qualified_contacts INT DEFAULT 0,
    conversions INT DEFAULT 0,
    revenue_generated DECIMAL(12,2) DEFAULT 0.00,
    is_demo TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

// Table Activités / Actions
$pdo->exec("CREATE TABLE IF NOT EXISTS perf_activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(100) NOT NULL DEFAULT 'call',
    relation_id INT DEFAULT NULL,
    project_id INT DEFAULT NULL,
    date DATE NOT NULL,
    manager VARCHAR(255) NOT NULL,
    status ENUM('planned', 'completed', 'cancelled') DEFAULT 'completed',
    title VARCHAR(255) NOT NULL,
    comments TEXT DEFAULT NULL,
    next_action_title VARCHAR(500) DEFAULT NULL,
    next_action_date DATE DEFAULT NULL,
    is_demo TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

// Table Bilan à 6 mois
$pdo->exec("CREATE TABLE IF NOT EXISTS perf_six_month_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    relation_id INT NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    contract_date DATE DEFAULT NULL,
    review_date DATE DEFAULT NULL,
    period_label VARCHAR(100) DEFAULT 'Semestre 1',
    followers_start INT DEFAULT 0,
    followers_current INT DEFAULT 0,
    qualified_contacts_target INT DEFAULT 0,
    qualified_contacts_real INT DEFAULT 0,
    content_adequacy_score INT DEFAULT 0,
    contents_produced_summary TEXT DEFAULT NULL,
    social_media_summary TEXT DEFAULT NULL,
    website_seo_summary TEXT DEFAULT NULL,
    events_summary TEXT DEFAULT NULL,
    google_ads_summary TEXT DEFAULT NULL,
    positive_points JSON DEFAULT NULL,
    challenges_faced JSON DEFAULT NULL,
    client_feedback TEXT DEFAULT NULL,
    internal_recommendations JSON DEFAULT NULL,
    next_actions_plan JSON DEFAULT NULL,
    status ENUM('draft', 'validated', 'shared') DEFAULT 'draft',
    is_demo TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

// ─── 2. SEED INITIAL AUTOMATIQUE (CAS RÉEL ITID & DÉMO BALISÉE) ──────────────

$count_relations = (int)$pdo->query("SELECT COUNT(*) FROM perf_relationships")->fetchColumn();
if ($count_relations === 0) {
    // 1. Client Réel ITID
    $itid_contract = json_encode([
        'monthly_fee' => 700.00,
        'duration' => 'Indéterminée (avec bilan d\'étape à 6 mois)',
        'services' => [
            'Animation des réseaux sociaux (Instagram, Facebook, LinkedIn)',
            'Création et publication de contenus réguliers, reels et shorts',
            'Valorisation de l\'expertise médicale (respect strict déontologie & RGPD)',
            'Refonte et suivi éditorial du site internet',
            'Accompagnement lors d\'événements professionnels & captation vidéo',
            'Conseil & pilotage stratégique Google Ads (campagnes financées par ITID)'
        ],
        'contract_date' => '2026-05-01',
        'review_6m_date' => '2026-11-01',
        'specific_notes' => 'Convention de partenariat et prestations de marketing digital. Forfait mensuel 700 € TTC.'
    ], JSON_UNESCAPED_UNICODE);

    $stmt = $pdo->prepare("INSERT INTO perf_relationships (
        name, company, role, type, status, email, phone, website, linkedin, instagram,
        start_date, source, manager, relation_level, last_contact_date, next_contact_date, next_action,
        contract_details, leads_generated, qualified_contacts, projects_count, conversions_count,
        revenue_generated, potential_revenue, actions_count, events_count, is_demo
    ) VALUES (
        'Institut ITID', 'ITID', 'Client Contractuel', 'client', 'active', 'contact@itid.fr', '01 00 00 00 00',
        'https://itid.fr', 'https://linkedin.com/company/itid', 'https://instagram.com/itid',
        '2026-05-01', 'Signature convention MDIV Business', 'Éric MEZATIO', 'Stratégique',
        '2026-09-18', '2026-10-10', 'Validation des contenus vidéo et logistique captation 24 oct Essoyes',
        ?, 68, 37, 3, 24, 3500.00, 8400.00, 18, 3, 0
    )");
    $stmt->execute([$itid_contract]);
    $itid_id = (int)$pdo->lastInsertId();

    // Projets réels ITID
    $stmtProj = $pdo->prepare("INSERT INTO perf_projects (
        name, description, relation_id, manager, type, start_date, target_end_date,
        budget, expected_revenue, actual_revenue, status, priority, progress_percent,
        objectives, risks, next_actions, is_demo
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

    $stmtProj->execute([
        'Refonte & Optimisation Éditoriale Site ITID',
        'Modernisation ergonomique du site web, optimisation mobile et SEO médical.',
        $itid_id, 'Éric MEZATIO', 'Site Web & SEO', '2026-05-15', '2026-10-30',
        1400.00, 1400.00, 1400.00, 'in_progress', 'high', 70,
        'Augmenter le taux de conversion visiteur en prise de contact qualifiée.',
        'Validation des maquettes et conformité réglementaire de communication de santé.',
        'Mise en ligne de la nouvelle section expertise & formulaires simplifiés.', 0
    ]);
    $proj1_id = (int)$pdo->lastInsertId();

    $stmtProj->execute([
        'Production Contenus Courts (Reels & Shorts) & Réseaux Sociaux ITID',
        'Scénarisation, montage et diffusion multicanale (Instagram, FB, LinkedIn).',
        $itid_id, 'Éric MEZATIO', 'Contenu & Réseaux', '2026-06-01', '2026-11-30',
        2100.00, 2100.00, 2100.00, 'in_progress', 'high', 60,
        'Atteindre +500 abonnés engagés et renforcer l\'autorité médicale.',
        'Disponibilité des praticiens pour la captation.',
        'Tournage du prochain lot de 6 vidéos format court.', 0
    ]);

    $stmtProj->execute([
        'Captation Événementielle & Valorisation BNE (Essoyes & Paris)',
        'Captation vidéo sur site lors du BNE Essoyes (24 oct) et de Paris (nov 2026).',
        $itid_id, 'Éric MEZATIO', 'Événementiel & Vidéo', '2026-10-24', '2026-11-30',
        700.00, 700.00, 700.00, 'planned', 'urgent', 25,
        'Couvrir l\'événement, réaliser des interviews professionnelles et générer du lead qualifié.',
        'Conditions techniques de prise de vue sur le salon.',
        'Validation du matériel caméra et calage du planning des intervenants.', 0
    ]);

    // 3 KPIs Contractuels ITID (is_contractual = 1, is_demo = 0)
    $stmtKpi = $pdo->prepare("INSERT INTO perf_kpis (
        name, description, category, unit, source, frequency, current_value, target_value,
        period, manager, status, calc_method, last_updated, is_contractual, relation_id, is_demo
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

    $stmtKpi->execute([
        'Évolution des abonnés sur les réseaux sociaux',
        'Progression cumulée de la communauté ITID sur Instagram, Facebook et LinkedIn (Indicateur Contractuel Majeur).',
        'reseaux_sociaux', 'followers', 'Comptes officiels ITID', 'mensuel',
        850, 1200, 'Semestre 1', 'Éric MEZATIO', 'on_track',
        'Somme des abonnés vérifiés Instagram + LinkedIn + Facebook', '2026-09-20', 1, $itid_id, 0
    ]);

    $stmtKpi->execute([
        'Nombre de contacts qualifiés générés',
        'Demandes entrantes ciblées et qualifiées transmises à l\'institut (Indicateur Contractuel Majeur).',
        'commercial', 'qualified_contacts', 'Formulaires site web & messages directs', 'mensuel',
        37, 50, 'Semestre 1', 'Éric MEZATIO', 'on_track',
        'Contacts ayant complété le formulaire ou formulé un besoin vérifié', '2026-09-20', 1, $itid_id, 0
    ]);

    $stmtKpi->execute([
        'Adéquation des contenus produits aux objectifs',
        'Indice de satisfaction et conformité de la ligne éditoriale validée par le client (Indicateur Contractuel Majeur).',
        'contenu', 'score', 'Revue éditoriale conjointe ITID / MDIV', 'mensuel',
        92, 95, 'Semestre 1', 'Éric MEZATIO', 'on_track',
        'Taux de validation sans retouche majeure sur 100 points', '2026-09-20', 1, $itid_id, 0
    ]);

    // Campagne Google Ads ITID (client_funded = 1)
    $stmtCamp = $pdo->prepare("INSERT INTO perf_campaigns (
        name, relation_id, channel, objective, budget, client_funded, start_date, end_date,
        content_details, impressions, views, clicks, leads, qualified_contacts, conversions, revenue_generated, is_demo
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

    $stmtCamp->execute([
        'Campagne Google Ads Search — Expertise & Soins ITID',
        $itid_id, 'google_ads', 'Génération de contacts qualifiés locaux',
        600.00, 1, '2026-06-15', '2026-09-30',
        'Mots-clés ciblés sur les pôles d\'excellence. Budget financé directement par ITID selon convention.',
        18500, 0, 940, 52, 31, 14, 4200.00, 0
    ]);

    // Activités réelles ITID
    $stmtAct = $pdo->prepare("INSERT INTO perf_activities (
        type, relation_id, project_id, date, manager, status, title, comments, next_action_title, next_action_date, is_demo
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

    $stmtAct->execute([
        'meeting', $itid_id, $proj1_id, '2026-09-15', 'Éric MEZATIO', 'completed',
        'Comité de pilotage mensuel ITID & revue des statistiques d\'audience',
        'Validation des maquettes responsive du site internet et analyse des retours Google Ads.',
        'Finaliser l\'intégration des 3 nouveaux formulaires qualifiés', '2026-09-28', 0
    ]);

    $stmtAct->execute([
        'event', $itid_id, null, '2026-10-24', 'Éric MEZATIO', 'planned',
        'Captation vidéo & Networking — BNE Essoyes 2026',
        'Présence sur place avec équipe MDIV pour captation des interventions et interviews professionnelles.',
        'Calage logistique et matériel avec Micke et équipe technique', '2026-10-15', 0
    ]);

    // Bilan 6 mois ITID (ébauche contractuelle)
    $stmtRev = $pdo->prepare("INSERT INTO perf_six_month_reviews (
        relation_id, client_name, contract_date, review_date, period_label,
        followers_start, followers_current, qualified_contacts_target, qualified_contacts_real,
        content_adequacy_score, contents_produced_summary, social_media_summary, website_seo_summary,
        events_summary, google_ads_summary, positive_points, challenges_faced, client_feedback,
        internal_recommendations, next_actions_plan, status, is_demo
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

    $stmtRev->execute([
        $itid_id, 'Institut ITID', '2026-05-01', '2026-11-01', 'Bilan Intermédiaire 6 Mois',
        320, 850, 50, 37, 92,
        '24 publications feed, 16 formats courts reels/shorts, 8 articles de fond orientés expertise médicale.',
        'Progression de +165% de la communauté cumulée. Taux d\'engagement moyen de 4.8% sur Instagram.',
        'Refonte UI livrée à 70%, temps de chargement réduit de 40%, hausse du référencement local.',
        'Préparation active du BNE Essoyes (24 oct 2026) et de l\'événement Paris (nov 2026).',
        'Campagne Search optimisée avec un coût par contact qualifié de 19,35 € financé par le client.',
        json_encode([
            'Forte adhésion de l\'audience aux vidéos courtes explicatives',
            'Excellente synergie et réactivité dans la validation des contenus',
            'Montée en puissance constante du nombre de contacts qualifiés'
        ], JSON_UNESCAPED_UNICODE),
        json_encode([
            'Délai de disponibilité des praticiens pour les tournages en présentiel',
            'Nécessité de relancer rapidement les prospects sous 24h ouvrées'
        ], JSON_UNESCAPED_UNICODE),
        'Très grande satisfaction de l\'institut quant au professionnalisme et à la clarté des livrables.',
        json_encode([
            'Accélérer sur le format vidéo court après la captation d\'Essoyes',
            'Mettre en place un outil de prise de rendez-vous automatique synchronisé',
            'Augmenter le budget Google Ads sur les créneaux à fort taux de conversion'
        ], JSON_UNESCAPED_UNICODE),
        json_encode([
            'Déploiement complet de la nouvelle version du site au 30 octobre',
            'Couverture vidéo exhaustive à Essoyes le 24 octobre',
            'Tenue de la session d\'évaluation formelle du semestre au 15 novembre 2026'
        ], JSON_UNESCAPED_UNICODE),
        'draft', 0
    ]);

    // 2. Exemple balisé Démonstration : Ambassadeur
    $ambassador_metrics = json_encode([
        'posts_count' => 12,
        'shares_count' => 34,
        'mentions_count' => 19,
        'engagement_rate' => 5.2,
        'activity_score' => 85,
        'weights' => ['leads' => 25, 'conversions' => 25, 'engagement' => 20, 'activity' => 15, 'revenue' => 15]
    ], JSON_UNESCAPED_UNICODE);

    $stmt->execute([
        'Dr. Alexandre Dupont', 'Cabinet Médical Avenir', 'Médecin Référent & Ambassadeur',
        'ambassador', 'active', 'alexandre.dupont@demo.fr', '06 12 34 56 78',
        'https://demo-ambassadeur.fr', 'https://linkedin.com/in/demo', '',
        '2026-06-01', 'Événement BNE', 'Éric MEZATIO', 'Partenaire Privilégié',
        '2026-09-10', '2026-10-15', 'Relance invitation événement Essoyes',
        $ambassador_metrics, 14, 9, 1, 4, 2800.00, 5000.00, 6, 2, 1 // is_demo = 1
    ]);

    // 3. Exemple balisé Démonstration : Apporteur d'affaires
    $referrer_metrics = json_encode([
        'commission_rate' => 10.0,
        'last_recommendation_date' => '2026-09-02',
        'contracts_signed' => 2
    ], JSON_UNESCAPED_UNICODE);

    $stmt->execute([
        'Synergie Consultants', 'Synergie Conseil SARL', 'Directeur Associé',
        'business_referrer', 'active', 'contact@synergie-demo.fr', '01 45 67 89 00',
        'https://synergie-demo.fr', 'https://linkedin.com/company/synergie-demo', '',
        '2026-07-01', 'Réseau BNE', 'Éric MEZATIO', 'Actif',
        '2026-09-02', '2026-10-05', 'Point mensuel sur les opportunités qualifiées',
        $referrer_metrics, 8, 5, 2, 2, 4500.00, 12000.00, 5, 1, 1 // is_demo = 1
    ]);
}

// ─── 3. DISPATCH DES ACTIONS ────────────────────────────────────────────────

// Action: GET_ALL
if ($action === 'get_all' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    // Relations
    $relationsStmt = $pdo->query("SELECT * FROM perf_relationships ORDER BY is_demo ASC, id DESC");
    $rawRelations = $relationsStmt->fetchAll(PDO::FETCH_ASSOC);
    $relations = array_map(function($r) {
        $r['id'] = (int)$r['id'];
        $r['leads_generated'] = (int)$r['leads_generated'];
        $r['qualified_contacts'] = (int)$r['qualified_contacts'];
        $r['projects_count'] = (int)$r['projects_count'];
        $r['conversions_count'] = (int)$r['conversions_count'];
        $r['revenue_generated'] = (float)$r['revenue_generated'];
        $r['potential_revenue'] = (float)$r['potential_revenue'];
        $r['actions_count'] = (int)$r['actions_count'];
        $r['events_count'] = (int)$r['events_count'];
        $r['recommendations_count'] = (int)$r['recommendations_count'];
        $r['is_demo'] = (bool)$r['is_demo'];
        $r['contract_details'] = !empty($r['contract_details']) ? json_decode($r['contract_details'], true) : null;
        $r['ambassador_metrics'] = !empty($r['ambassador_metrics']) ? json_decode($r['ambassador_metrics'], true) : null;
        $r['referrer_metrics'] = !empty($r['referrer_metrics']) ? json_decode($r['referrer_metrics'], true) : null;
        
        // Taux de conversion
        $r['conversion_rate'] = $r['leads_generated'] > 0 
            ? round(($r['conversions_count'] / $r['leads_generated']) * 100, 1) 
            : null;
        return $r;
    }, $rawRelations);

    // Projets
    $projectsStmt = $pdo->query("SELECT p.*, r.name as client_name FROM perf_projects p LEFT JOIN perf_relationships r ON p.relation_id = r.id ORDER BY p.is_demo ASC, p.id DESC");
    $rawProjects = $projectsStmt->fetchAll(PDO::FETCH_ASSOC);
    $projects = array_map(function($p) {
        $p['id'] = (int)$p['id'];
        $p['relation_id'] = (int)$p['relation_id'];
        $p['budget'] = (float)$p['budget'];
        $p['expected_revenue'] = (float)$p['expected_revenue'];
        $p['actual_revenue'] = (float)$p['actual_revenue'];
        $p['progress_percent'] = (int)$p['progress_percent'];
        $p['is_demo'] = (bool)$p['is_demo'];
        return $p;
    }, $rawProjects);

    // KPIs
    $kpiStmt = $pdo->query("SELECT * FROM perf_kpis ORDER BY is_demo ASC, is_contractual DESC, id ASC");
    $rawKpis = $kpiStmt->fetchAll(PDO::FETCH_ASSOC);
    $kpis = array_map(function($k) {
        $k['id'] = (int)$k['id'];
        $k['current_value'] = (float)$k['current_value'];
        $k['target_value'] = (float)$k['target_value'];
        $k['is_contractual'] = (bool)$k['is_contractual'];
        $k['is_demo'] = (bool)$k['is_demo'];
        $k['relation_id'] = $k['relation_id'] ? (int)$k['relation_id'] : null;
        $k['project_id'] = $k['project_id'] ? (int)$k['project_id'] : null;
        return $k;
    }, $rawKpis);

    // Campagnes
    $campStmt = $pdo->query("SELECT c.*, r.name as client_name FROM perf_campaigns c LEFT JOIN perf_relationships r ON c.relation_id = r.id ORDER BY c.is_demo ASC, c.id DESC");
    $rawCamp = $campStmt->fetchAll(PDO::FETCH_ASSOC);
    $campaigns = array_map(function($c) {
        $c['id'] = (int)$c['id'];
        $c['relation_id'] = (int)$c['relation_id'];
        $c['budget'] = (float)$c['budget'];
        $c['client_funded'] = (bool)$c['client_funded'];
        $c['impressions'] = (int)$c['impressions'];
        $c['views'] = (int)$c['views'];
        $c['clicks'] = (int)$c['clicks'];
        $c['leads'] = (int)$c['leads'];
        $c['qualified_contacts'] = (int)$c['qualified_contacts'];
        $c['conversions'] = (int)$c['conversions'];
        $c['revenue_generated'] = (float)$c['revenue_generated'];
        $c['is_demo'] = (bool)$c['is_demo'];
        return $c;
    }, $rawCamp);

    // Activités
    $actStmt = $pdo->query("SELECT a.*, r.name as relation_name, p.name as project_name FROM perf_activities a LEFT JOIN perf_relationships r ON a.relation_id = r.id LEFT JOIN perf_projects p ON a.project_id = p.id ORDER BY a.is_demo ASC, a.date DESC");
    $rawAct = $actStmt->fetchAll(PDO::FETCH_ASSOC);
    $activities = array_map(function($a) {
        $a['id'] = (int)$a['id'];
        $a['relation_id'] = $a['relation_id'] ? (int)$a['relation_id'] : null;
        $a['project_id'] = $a['project_id'] ? (int)$a['project_id'] : null;
        $a['is_demo'] = (bool)$a['is_demo'];
        return $a;
    }, $rawAct);

    // Bilans 6 mois
    $revStmt = $pdo->query("SELECT * FROM perf_six_month_reviews ORDER BY is_demo ASC, id DESC");
    $rawRev = $revStmt->fetchAll(PDO::FETCH_ASSOC);
    $sixMonthReviews = array_map(function($rev) {
        $rev['id'] = (int)$rev['id'];
        $rev['relation_id'] = (int)$rev['relation_id'];
        $rev['followers_start'] = (int)$rev['followers_start'];
        $rev['followers_current'] = (int)$rev['followers_current'];
        $rev['qualified_contacts_target'] = (int)$rev['qualified_contacts_target'];
        $rev['qualified_contacts_real'] = (int)$rev['qualified_contacts_real'];
        $rev['content_adequacy_score'] = (int)$rev['content_adequacy_score'];
        $rev['positive_points'] = !empty($rev['positive_points']) ? json_decode($rev['positive_points'], true) : [];
        $rev['challenges_faced'] = !empty($rev['challenges_faced']) ? json_decode($rev['challenges_faced'], true) : [];
        $rev['internal_recommendations'] = !empty($rev['internal_recommendations']) ? json_decode($rev['internal_recommendations'], true) : [];
        $rev['next_actions_plan'] = !empty($rev['next_actions_plan']) ? json_decode($rev['next_actions_plan'], true) : [];
        $rev['is_demo'] = (bool)$rev['is_demo'];
        return $rev;
    }, $rawRev);

    // Calcul du résumé global KPI
    $active_relations = count(array_filter($relations, fn($r) => $r['status'] === 'active'));
    $total_leads = array_sum(array_column($relations, 'leads_generated'));
    $total_qualified = array_sum(array_column($relations, 'qualified_contacts'));
    $total_conversions = array_sum(array_column($relations, 'conversions_count'));
    $total_revenue = array_sum(array_column($relations, 'revenue_generated'));
    $total_potential = array_sum(array_column($relations, 'potential_revenue'));
    $active_projects = count(array_filter($projects, fn($p) => in_array($p['status'], ['in_progress', 'planned', 'qualifying'])));
    $completed_projects = count(array_filter($projects, fn($p) => $p['status'] === 'completed'));
    $active_partners = count(array_filter($relations, fn($r) => $r['type'] === 'partner' && $r['status'] === 'active'));
    $active_ambassadors = count(array_filter($relations, fn($r) => $r['type'] === 'ambassador' && $r['status'] === 'active'));
    $active_referrers = count(array_filter($relations, fn($r) => $r['type'] === 'business_referrer' && $r['status'] === 'active'));
    $actions_completed = count(array_filter($activities, fn($a) => $a['status'] === 'completed'));
    $today = date('Y-m-d');
    $actions_delayed = count(array_filter($activities, fn($a) => $a['status'] === 'planned' && $a['date'] < $today));

    $conversion_rate = $total_leads > 0 ? round(($total_conversions / $total_leads) * 100, 1) : 0;

    $summary = [
        'active_relations' => $active_relations,
        'new_contacts' => count($relations),
        'qualified_contacts' => $total_qualified,
        'leads_generated' => $total_leads,
        'active_projects' => $active_projects,
        'completed_projects' => $completed_projects,
        'conversion_rate' => $conversion_rate,
        'revenue_generated' => $total_revenue,
        'potential_revenue' => $total_potential,
        'active_partners' => $active_partners,
        'active_ambassadors' => $active_ambassadors,
        'active_referrers' => $active_referrers,
        'actions_completed' => $actions_completed,
        'actions_delayed' => $actions_delayed,
    ];

    echo json_encode([
        'success' => true,
        'data' => [
            'relations' => $relations,
            'projects' => $projects,
            'kpis' => $kpis,
            'campaigns' => $campaigns,
            'activities' => $activities,
            'sixMonthReviews' => $sixMonthReviews,
            'summary' => $summary,
        ]
    ]);
    exit();
}

// Action: SAVE_RELATION
if ($action === 'save_relation' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = isset($data->id) ? (int)$data->id : 0;
    $contract_json = isset($data->contract_details) ? json_encode($data->contract_details, JSON_UNESCAPED_UNICODE) : null;
    $ambassador_json = isset($data->ambassador_metrics) ? json_encode($data->ambassador_metrics, JSON_UNESCAPED_UNICODE) : null;
    $referrer_json = isset($data->referrer_metrics) ? json_encode($data->referrer_metrics, JSON_UNESCAPED_UNICODE) : null;

    if ($id > 0) {
        $stmt = $pdo->prepare("UPDATE perf_relationships SET
            name=?, company=?, role=?, type=?, status=?, email=?, phone=?, website=?, linkedin=?, instagram=?,
            start_date=?, source=?, manager=?, relation_level=?, last_contact_date=?, next_contact_date=?, next_action=?,
            notes=?, comments=?, contract_details=?, ambassador_metrics=?, referrer_metrics=?,
            leads_generated=?, qualified_contacts=?, revenue_generated=?, potential_revenue=?
            WHERE id=?");
        $stmt->execute([
            $data->name ?? '', $data->company ?? '', $data->role ?? '', $data->type ?? 'prospect',
            $data->status ?? 'active', $data->email ?? '', $data->phone ?? '', $data->website ?? '',
            $data->linkedin ?? '', $data->instagram ?? '', $data->start_date ?? null, $data->source ?? '',
            $data->manager ?? '', $data->relation_level ?? '', $data->last_contact_date ?? null,
            $data->next_contact_date ?? null, $data->next_action ?? '', $data->notes ?? '', $data->comments ?? '',
            $contract_json, $ambassador_json, $referrer_json,
            $data->leads_generated ?? 0, $data->qualified_contacts ?? 0,
            $data->revenue_generated ?? 0.0, $data->potential_revenue ?? 0.0, $id
        ]);
    } else {
        $stmt = $pdo->prepare("INSERT INTO perf_relationships (
            name, company, role, type, status, email, phone, website, linkedin, instagram,
            start_date, source, manager, relation_level, last_contact_date, next_contact_date, next_action,
            notes, comments, contract_details, ambassador_metrics, referrer_metrics,
            leads_generated, qualified_contacts, revenue_generated, potential_revenue, is_demo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $data->name ?? '', $data->company ?? '', $data->role ?? '', $data->type ?? 'prospect',
            $data->status ?? 'active', $data->email ?? '', $data->phone ?? '', $data->website ?? '',
            $data->linkedin ?? '', $data->instagram ?? '', $data->start_date ?? null, $data->source ?? '',
            $data->manager ?? '', $data->relation_level ?? '', $data->last_contact_date ?? null,
            $data->next_contact_date ?? null, $data->next_action ?? '', $data->notes ?? '', $data->comments ?? '',
            $contract_json, $ambassador_json, $referrer_json,
            $data->leads_generated ?? 0, $data->qualified_contacts ?? 0,
            $data->revenue_generated ?? 0.0, $data->potential_revenue ?? 0.0,
            isset($data->is_demo) && $data->is_demo ? 1 : 0
        ]);
        $id = (int)$pdo->lastInsertId();
    }

    echo json_encode(['success' => true, 'data' => ['id' => $id]]);
    exit();
}

// Action: DELETE_RELATION
if ($action === 'delete_relation' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = (int)($data->id ?? 0);
    $stmt = $pdo->prepare("DELETE FROM perf_relationships WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(['success' => true]);
    exit();
}

// Action: SAVE_PROJECT
if ($action === 'save_project' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = isset($data->id) ? (int)$data->id : 0;
    if ($id > 0) {
        $stmt = $pdo->prepare("UPDATE perf_projects SET
            name=?, description=?, relation_id=?, manager=?, type=?, start_date=?, target_end_date=?,
            budget=?, expected_revenue=?, actual_revenue=?, status=?, priority=?, progress_percent=?,
            objectives=?, risks=?, blockers=?, next_actions=?, notes=?
            WHERE id=?");
        $stmt->execute([
            $data->name ?? '', $data->description ?? '', (int)($data->relation_id ?? 0),
            $data->manager ?? '', $data->type ?? 'Projet', $data->start_date ?? null,
            $data->target_end_date ?? null, $data->budget ?? 0, $data->expected_revenue ?? 0,
            $data->actual_revenue ?? 0, $data->status ?? 'in_progress', $data->priority ?? 'medium',
            $data->progress_percent ?? 0, $data->objectives ?? '', $data->risks ?? '',
            $data->blockers ?? '', $data->next_actions ?? '', $data->notes ?? '', $id
        ]);
    } else {
        $stmt = $pdo->prepare("INSERT INTO perf_projects (
            name, description, relation_id, manager, type, start_date, target_end_date,
            budget, expected_revenue, actual_revenue, status, priority, progress_percent,
            objectives, risks, blockers, next_actions, notes, is_demo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $data->name ?? '', $data->description ?? '', (int)($data->relation_id ?? 0),
            $data->manager ?? '', $data->type ?? 'Projet', $data->start_date ?? null,
            $data->target_end_date ?? null, $data->budget ?? 0, $data->expected_revenue ?? 0,
            $data->actual_revenue ?? 0, $data->status ?? 'in_progress', $data->priority ?? 'medium',
            $data->progress_percent ?? 0, $data->objectives ?? '', $data->risks ?? '',
            $data->blockers ?? '', $data->next_actions ?? '', $data->notes ?? '',
            isset($data->is_demo) && $data->is_demo ? 1 : 0
        ]);
        $id = (int)$pdo->lastInsertId();
    }
    echo json_encode(['success' => true, 'data' => ['id' => $id]]);
    exit();
}

// Action: DELETE_PROJECT
if ($action === 'delete_project' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = (int)($data->id ?? 0);
    $stmt = $pdo->prepare("DELETE FROM perf_projects WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(['success' => true]);
    exit();
}

// Action: SAVE_KPI
if ($action === 'save_kpi' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = isset($data->id) ? (int)$data->id : 0;
    if ($id > 0) {
        $stmt = $pdo->prepare("UPDATE perf_kpis SET
            name=?, description=?, category=?, unit=?, source=?, frequency=?, current_value=?, target_value=?,
            period=?, manager=?, status=?, calc_method=?, last_updated=?, is_contractual=?, relation_id=?, project_id=?
            WHERE id=?");
        $stmt->execute([
            $data->name ?? '', $data->description ?? '', $data->category ?? 'general',
            $data->unit ?? 'number', $data->source ?? '', $data->frequency ?? 'mensuel',
            $data->current_value ?? 0, $data->target_value ?? 0, $data->period ?? 'En cours',
            $data->manager ?? '', $data->status ?? 'on_track', $data->calc_method ?? '',
            date('Y-m-d'), isset($data->is_contractual) && $data->is_contractual ? 1 : 0,
            !empty($data->relation_id) ? (int)$data->relation_id : null,
            !empty($data->project_id) ? (int)$data->project_id : null, $id
        ]);
    } else {
        $stmt = $pdo->prepare("INSERT INTO perf_kpis (
            name, description, category, unit, source, frequency, current_value, target_value,
            period, manager, status, calc_method, last_updated, is_contractual, relation_id, project_id, is_demo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $data->name ?? '', $data->description ?? '', $data->category ?? 'general',
            $data->unit ?? 'number', $data->source ?? '', $data->frequency ?? 'mensuel',
            $data->current_value ?? 0, $data->target_value ?? 0, $data->period ?? 'En cours',
            $data->manager ?? '', $data->status ?? 'on_track', $data->calc_method ?? '',
            date('Y-m-d'), isset($data->is_contractual) && $data->is_contractual ? 1 : 0,
            !empty($data->relation_id) ? (int)$data->relation_id : null,
            !empty($data->project_id) ? (int)$data->project_id : null,
            isset($data->is_demo) && $data->is_demo ? 1 : 0
        ]);
        $id = (int)$pdo->lastInsertId();
    }
    echo json_encode(['success' => true, 'data' => ['id' => $id]]);
    exit();
}

// Action: UPDATE_KPI_VALUE
if ($action === 'update_kpi_value' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = (int)($data->id ?? 0);
    $val = (float)($data->current_value ?? 0);
    $stmt = $pdo->prepare("UPDATE perf_kpis SET current_value=?, last_updated=? WHERE id=?");
    $stmt->execute([$val, date('Y-m-d'), $id]);
    echo json_encode(['success' => true]);
    exit();
}

// Action: DELETE_KPI
if ($action === 'delete_kpi' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = (int)($data->id ?? 0);
    $stmt = $pdo->prepare("DELETE FROM perf_kpis WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(['success' => true]);
    exit();
}

// Action: SAVE_ACTIVITY
if ($action === 'save_activity' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = isset($data->id) ? (int)$data->id : 0;
    if ($id > 0) {
        $stmt = $pdo->prepare("UPDATE perf_activities SET
            type=?, relation_id=?, project_id=?, date=?, manager=?, status=?, title=?, comments=?,
            next_action_title=?, next_action_date=? WHERE id=?");
        $stmt->execute([
            $data->type ?? 'call', !empty($data->relation_id) ? (int)$data->relation_id : null,
            !empty($data->project_id) ? (int)$data->project_id : null, $data->date ?? date('Y-m-d'),
            $data->manager ?? '', $data->status ?? 'completed', $data->title ?? '',
            $data->comments ?? '', $data->next_action_title ?? null, $data->next_action_date ?? null, $id
        ]);
    } else {
        $stmt = $pdo->prepare("INSERT INTO perf_activities (
            type, relation_id, project_id, date, manager, status, title, comments,
            next_action_title, next_action_date, is_demo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $data->type ?? 'call', !empty($data->relation_id) ? (int)$data->relation_id : null,
            !empty($data->project_id) ? (int)$data->project_id : null, $data->date ?? date('Y-m-d'),
            $data->manager ?? '', $data->status ?? 'completed', $data->title ?? '',
            $data->comments ?? '', $data->next_action_title ?? null, $data->next_action_date ?? null,
            isset($data->is_demo) && $data->is_demo ? 1 : 0
        ]);
        $id = (int)$pdo->lastInsertId();
    }
    echo json_encode(['success' => true, 'data' => ['id' => $id]]);
    exit();
}

// Action: DELETE_ACTIVITY
if ($action === 'delete_activity' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = (int)($data->id ?? 0);
    $stmt = $pdo->prepare("DELETE FROM perf_activities WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(['success' => true]);
    exit();
}

// Action: SAVE_CAMPAIGN
if ($action === 'save_campaign' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = isset($data->id) ? (int)$data->id : 0;
    if ($id > 0) {
        $stmt = $pdo->prepare("UPDATE perf_campaigns SET
            name=?, relation_id=?, channel=?, objective=?, budget=?, client_funded=?, start_date=?, end_date=?,
            content_details=?, impressions=?, views=?, clicks=?, leads=?, qualified_contacts=?, conversions=?, revenue_generated=?
            WHERE id=?");
        $stmt->execute([
            $data->name ?? '', (int)($data->relation_id ?? 0), $data->channel ?? 'google_ads',
            $data->objective ?? '', $data->budget ?? 0, isset($data->client_funded) && $data->client_funded ? 1 : 0,
            $data->start_date ?? null, $data->end_date ?? null, $data->content_details ?? '',
            $data->impressions ?? 0, $data->views ?? 0, $data->clicks ?? 0,
            $data->leads ?? 0, $data->qualified_contacts ?? 0, $data->conversions ?? 0,
            $data->revenue_generated ?? 0, $id
        ]);
    } else {
        $stmt = $pdo->prepare("INSERT INTO perf_campaigns (
            name, relation_id, channel, objective, budget, client_funded, start_date, end_date,
            content_details, impressions, views, clicks, leads, qualified_contacts, conversions, revenue_generated, is_demo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $data->name ?? '', (int)($data->relation_id ?? 0), $data->channel ?? 'google_ads',
            $data->objective ?? '', $data->budget ?? 0, isset($data->client_funded) && $data->client_funded ? 1 : 0,
            $data->start_date ?? null, $data->end_date ?? null, $data->content_details ?? '',
            $data->impressions ?? 0, $data->views ?? 0, $data->clicks ?? 0,
            $data->leads ?? 0, $data->qualified_contacts ?? 0, $data->conversions ?? 0,
            $data->revenue_generated ?? 0, isset($data->is_demo) && $data->is_demo ? 1 : 0
        ]);
        $id = (int)$pdo->lastInsertId();
    }
    echo json_encode(['success' => true, 'data' => ['id' => $id]]);
    exit();
}

// Action: SAVE_SIX_MONTH_REVIEW
if ($action === 'save_six_month_review' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = isset($data->id) ? (int)$data->id : 0;
    $pos_json = isset($data->positive_points) ? json_encode($data->positive_points, JSON_UNESCAPED_UNICODE) : '[]';
    $chal_json = isset($data->challenges_faced) ? json_encode($data->challenges_faced, JSON_UNESCAPED_UNICODE) : '[]';
    $rec_json = isset($data->internal_recommendations) ? json_encode($data->internal_recommendations, JSON_UNESCAPED_UNICODE) : '[]';
    $plan_json = isset($data->next_actions_plan) ? json_encode($data->next_actions_plan, JSON_UNESCAPED_UNICODE) : '[]';

    if ($id > 0) {
        $stmt = $pdo->prepare("UPDATE perf_six_month_reviews SET
            relation_id=?, client_name=?, contract_date=?, review_date=?, period_label=?,
            followers_start=?, followers_current=?, qualified_contacts_target=?, qualified_contacts_real=?,
            content_adequacy_score=?, contents_produced_summary=?, social_media_summary=?, website_seo_summary=?,
            events_summary=?, google_ads_summary=?, positive_points=?, challenges_faced=?, client_feedback=?,
            internal_recommendations=?, next_actions_plan=?, status=?
            WHERE id=?");
        $stmt->execute([
            (int)($data->relation_id ?? 0), $data->client_name ?? '', $data->contract_date ?? null,
            $data->review_date ?? null, $data->period_label ?? 'Semestre 1',
            $data->followers_start ?? 0, $data->followers_current ?? 0,
            $data->qualified_contacts_target ?? 0, $data->qualified_contacts_real ?? 0,
            $data->content_adequacy_score ?? 0, $data->contents_produced_summary ?? '',
            $data->social_media_summary ?? '', $data->website_seo_summary ?? '',
            $data->events_summary ?? '', $data->google_ads_summary ?? '',
            $pos_json, $chal_json, $data->client_feedback ?? '',
            $rec_json, $plan_json, $data->status ?? 'draft', $id
        ]);
    } else {
        $stmt = $pdo->prepare("INSERT INTO perf_six_month_reviews (
            relation_id, client_name, contract_date, review_date, period_label,
            followers_start, followers_current, qualified_contacts_target, qualified_contacts_real,
            content_adequacy_score, contents_produced_summary, social_media_summary, website_seo_summary,
            events_summary, google_ads_summary, positive_points, challenges_faced, client_feedback,
            internal_recommendations, next_actions_plan, status, is_demo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            (int)($data->relation_id ?? 0), $data->client_name ?? '', $data->contract_date ?? null,
            $data->review_date ?? null, $data->period_label ?? 'Semestre 1',
            $data->followers_start ?? 0, $data->followers_current ?? 0,
            $data->qualified_contacts_target ?? 0, $data->qualified_contacts_real ?? 0,
            $data->content_adequacy_score ?? 0, $data->contents_produced_summary ?? '',
            $data->social_media_summary ?? '', $data->website_seo_summary ?? '',
            $data->events_summary ?? '', $data->google_ads_summary ?? '',
            $pos_json, $chal_json, $data->client_feedback ?? '',
            $rec_json, $plan_json, $data->status ?? 'draft',
            isset($data->is_demo) && $data->is_demo ? 1 : 0
        ]);
        $id = (int)$pdo->lastInsertId();
    }
    echo json_encode(['success' => true, 'data' => ['id' => $id]]);
    exit();
}

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Action inconnue']);
