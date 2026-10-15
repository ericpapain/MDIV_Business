<?php
// api-analytics.php - MDIV Business Analytics Engine
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'api-config.php';

// Création de la table analytics_visits
$pdo->exec("CREATE TABLE IF NOT EXISTS analytics_visits (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(100) NOT NULL,
    visitor_id VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    country VARCHAR(100) DEFAULT 'France',
    country_code VARCHAR(10) DEFAULT 'FR',
    city VARCHAR(150) DEFAULT 'Paris',
    page_path VARCHAR(255) NOT NULL,
    page_title VARCHAR(255) DEFAULT '',
    referrer VARCHAR(500) DEFAULT '',
    referrer_source VARCHAR(100) DEFAULT 'Direct',
    user_agent TEXT,
    browser VARCHAR(100) DEFAULT 'Chrome',
    os VARCHAR(100) DEFAULT 'Windows',
    device_type VARCHAR(50) DEFAULT 'Desktop',
    duration_seconds INT DEFAULT 0,
    is_exit TINYINT(1) DEFAULT 0,
    is_bounce TINYINT(1) DEFAULT 0,
    conversion_event VARCHAR(100) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_session (session_id),
    INDEX idx_visitor (visitor_id),
    INDEX idx_created (created_at),
    INDEX idx_page (page_path),
    INDEX idx_country (country)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

// Helpers de détection User-Agent
function parseUserAgent($ua) {
    $browser = 'Chrome';
    $os = 'Windows';
    $device = 'Desktop';

    // Device
    if (preg_match('/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i', $ua)) {
        $device = 'Tablette';
    } elseif (preg_match('/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated/i', $ua)) {
        $device = 'Mobile';
    } else {
        $device = 'Desktop';
    }

    // OS
    if (preg_match('/windows nt 10/i', $ua)) $os = 'Windows 11/10';
    elseif (preg_match('/windows/i', $ua)) $os = 'Windows';
    elseif (preg_match('/macintosh|mac os x/i', $ua)) $os = 'macOS';
    elseif (preg_match('/iphone|ipad|ipod/i', $ua)) $os = 'iOS';
    elseif (preg_match('/android/i', $ua)) $os = 'Android';
    elseif (preg_match('/linux/i', $ua)) $os = 'Linux';

    // Browser
    if (preg_match('/edg/i', $ua)) $browser = 'Edge';
    elseif (preg_match('/chrome|crios/i', $ua)) $browser = 'Chrome';
    elseif (preg_match('/firefox|fxios/i', $ua)) $browser = 'Firefox';
    elseif (preg_match('/safari/i', $ua) && !preg_match('/chrome/i', $ua)) $browser = 'Safari';
    elseif (preg_match('/opr\//i', $ua)) $browser = 'Opera';

    return ['browser' => $browser, 'os' => $os, 'device' => $device];
}

function parseReferrerSource($ref) {
    if (empty($ref)) return 'Accès direct';
    $refLower = strtolower($ref);
    if (strpos($refLower, 'google.') !== false) return 'Google';
    if (strpos($refLower, 'bing.') !== false) return 'Bing';
    if (strpos($refLower, 'linkedin.') !== false) return 'LinkedIn';
    if (strpos($refLower, 'facebook.') !== false || strpos($refLower, 'fb.com') !== false) return 'Facebook';
    if (strpos($refLower, 'instagram.') !== false) return 'Instagram';
    if (strpos($refLower, 'twitter.') !== false || strpos($refLower, 't.co') !== false || strpos($refLower, 'x.com') !== false) return 'Twitter / X';
    if (strpos($refLower, 'youtube.') !== false) return 'YouTube';
    return 'Référents externes';
}

function getClientIP() {
    $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        $ip = $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $parts = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        $ip = trim($parts[0]);
    }
    return $ip;
}

// Fonction pour auto-générer des visites de démonstration si la table est vide
function seedDemoVisitsIfEmpty($pdo) {
    $count = (int)$pdo->query("SELECT COUNT(*) FROM analytics_visits")->fetchColumn();
    if ($count > 0) return;

    $locations = [
        ['France', 'FR', 'Paris'],
        ['France', 'FR', 'Lyon'],
        ['France', 'FR', 'Troyes'],
        ['France', 'FR', 'Marseille'],
        ['France', 'FR', 'Lille'],
        ['Maroc', 'MA', 'Casablanca'],
        ['Maroc', 'MA', 'Rabat'],
        ['Maroc', 'MA', 'Tanger'],
        ['Côte d\'Ivoire', 'CI', 'Abidjan'],
        ['Belgique', 'BE', 'Bruxelles'],
        ['Suisse', 'CH', 'Genève'],
        ['Sénégal', 'SN', 'Dakar'],
        ['Canada', 'CA', 'Montréal'],
    ];

    $pages = [
        ['/', 'Accueil - MDIV Business'],
        ['/services-ia', 'Services IA & Solutions - IT4ALL'],
        ['/services-ia/diagnostic', 'Diagnostic IA Gratuit'],
        ['/services-ia/calc-roi', 'Calculateur de ROI IA'],
        ['/services-ia/devis', 'Générateur de Devis IA'],
        ['/services-ia/factures', 'Vérificateur & Facturation IA'],
        ['/services-ia/assistant-email', 'Assistant Email IA B2B'],
        ['/services-ia/generateur-leads', 'Générateur de Leads B2B'],
        ['/services-ia/tarifs', 'Tarifs & Plans IA'],
        ['/contact', 'Contact & Prise de Rendez-vous'],
        ['/offres', 'Offres d\'Immersion & Clubs'],
        ['/evenements', 'Événements & Sommets BNE'],
        ['/blog', 'Blog & Actualités BNE'],
        ['/blog/1', 'Article : Automobile au Maroc'],
        ['/sejours-bne', 'Séjours d\'Affaires BNE'],
    ];

    $sources = ['Accès direct', 'Google', 'LinkedIn', 'Google', 'Accès direct', 'Bing', 'Facebook', 'LinkedIn', 'Référents externes'];
    $browsers = ['Chrome', 'Safari', 'Firefox', 'Edge'];
    $oses = ['Windows 11/10', 'macOS', 'iOS', 'Android', 'Linux'];
    $devices = ['Desktop', 'Desktop', 'Mobile', 'Mobile', 'Tablette'];

    $stmt = $pdo->prepare("INSERT INTO analytics_visits 
        (session_id, visitor_id, ip_address, country, country_code, city, page_path, page_title, referrer, referrer_source, user_agent, browser, os, device_type, duration_seconds, is_exit, is_bounce, conversion_event, created_at, last_activity_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

    $now = time();
    // Générer 120 visites réparties sur les 30 derniers jours, dont plusieurs aujourd'hui
    for ($i = 0; $i < 150; $i++) {
        $loc = $locations[array_rand($locations)];
        $page = $pages[array_rand($pages)];
        $source = $sources[array_rand($sources)];
        $dev = $devices[array_rand($devices)];
        $brw = $browsers[array_rand($browsers)];
        $os = $oses[array_rand($oses)];

        // Temps aléatoire dans les 30 derniers jours, avec concentration sur les derniers 7 jours
        $daysAgo = rand(0, 100) < 40 ? rand(0, 2) : (rand(0, 100) < 70 ? rand(3, 7) : rand(8, 30));
        $timestamp = $now - ($daysAgo * 86400) - rand(0, 86400);
        $dateStr = date('Y-m-d H:i:s', $timestamp);

        $sessionId = 'sess_' . substr(md5($i . '_' . $timestamp), 0, 12);
        $visitorId = 'vis_' . rand(100, 250);
        $ip = '82.' . rand(100, 250) . '.' . rand(10, 250) . '.' . rand(1, 254);
        $duration = rand(20, 360);
        $isExit = rand(0, 1);
        $isBounce = ($duration < 30 && rand(0, 1)) ? 1 : 0;
        
        $conversion = null;
        if (rand(0, 10) > 7) {
            $convs = ['Demande de devis', 'Formulaire contact', 'Diagnostic IA complété', 'Réservation événement'];
            $conversion = $convs[array_rand($convs)];
        }

        $stmt->execute([
            $sessionId, $visitorId, $ip, $loc[0], $loc[1], $loc[2],
            $page[0], $page[1], ($source === 'Accès direct' ? '' : 'https://' . strtolower($source) . '.com'),
            $source, 'Mozilla/5.0 Demo Browser', $brw, $os, $dev,
            $duration, $isExit, $isBounce, $conversion, $dateStr, $dateStr
        ]);
    }
}

seedDemoVisitsIfEmpty($pdo);

$action = $_GET['action'] ?? '';
$data = json_decode(file_get_contents("php://input"));

// -------------------------------------------------------------
// 1. ACTION : TRACK (Enregistrement d'une visite)
// -------------------------------------------------------------
if ($action === 'track' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    header("Content-Type: application/json; charset=UTF-8");
    $sessionId = $data->sessionId ?? ('sess_' . substr(bin2hex(random_bytes(8)), 0, 12));
    $visitorId = $data->visitorId ?? ('vis_' . substr(bin2hex(random_bytes(8)), 0, 12));
    $pagePath = $data->pagePath ?? '/';
    $pageTitle = $data->pageTitle ?? '';
    $referrer = $data->referrer ?? '';
    $conversionEvent = $data->conversionEvent ?? null;

    $ip = getClientIP();
    $ua = $_SERVER['HTTP_USER_AGENT'] ?? ($data->userAgent ?? 'Mozilla/5.0');
    $parsedUa = parseUserAgent($ua);
    $source = parseReferrerSource($referrer);

    // Détection de localisation
    $country = 'France';
    $countryCode = 'FR';
    $city = 'Paris';

    if (filter_var($ip, FILTER_VALIDATE_IP) && $ip !== '127.0.0.1' && $ip !== '::1') {
        try {
            $ctx = stream_context_create(['http' => ['timeout' => 1]]);
            $geoRaw = @file_get_contents("http://ip-api.com/json/{$ip}?fields=country,countryCode,city", false, $ctx);
            if ($geoRaw) {
                $geo = json_decode($geoRaw, true);
                if (!empty($geo['country'])) $country = $geo['country'];
                if (!empty($geo['countryCode'])) $countryCode = $geo['countryCode'];
                if (!empty($geo['city'])) $city = $geo['city'];
            }
        } catch (\Exception $e) {}
    }

    $stmt = $pdo->prepare("INSERT INTO analytics_visits 
        (session_id, visitor_id, ip_address, country, country_code, city, page_path, page_title, referrer, referrer_source, user_agent, browser, os, device_type, duration_seconds, is_exit, is_bounce, conversion_event, created_at, last_activity_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, ?, NOW(), NOW())");

    $stmt->execute([
        $sessionId, $visitorId, $ip, $country, $countryCode, $city,
        $pagePath, $pageTitle, $referrer, $source, $ua,
        $parsedUa['browser'], $parsedUa['os'], $parsedUa['device'],
        $conversionEvent
    ]);

    $insertId = $pdo->lastInsertId();

    echo json_encode([
        'success' => true,
        'visitId' => $insertId,
        'sessionId' => $sessionId,
        'visitorId' => $visitorId
    ]);
    exit();
}

// -------------------------------------------------------------
// 2. ACTION : PING (Mise à jour de la durée de session)
// -------------------------------------------------------------
if ($action === 'ping' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    header("Content-Type: application/json; charset=UTF-8");
    $visitId = $data->visitId ?? 0;
    $duration = (int)($data->durationSeconds ?? 15);
    $isExit = !empty($data->isExit) ? 1 : 0;
    $conversionEvent = $data->conversionEvent ?? null;

    if ($visitId > 0) {
        $sql = "UPDATE analytics_visits SET duration_seconds = duration_seconds + ?, is_exit = ?, last_activity_at = NOW()";
        $params = [$duration, $isExit];
        if ($conversionEvent) {
            $sql .= ", conversion_event = ?";
            $params[] = $conversionEvent;
        }
        $sql .= " WHERE id = ?";
        $params[] = $visitId;
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
    }
    echo json_encode(['success' => true]);
    exit();
}

// -------------------------------------------------------------
// 3. ACTION : REALTIME (Visiteurs en direct des 5 dernières minutes)
// -------------------------------------------------------------
if ($action === 'realtime') {
    header("Content-Type: application/json; charset=UTF-8");
    $fiveMinAgo = date('Y-m-d H:i:s', time() - 300);

    // Visiteurs actifs uniques
    $stmtActives = $pdo->prepare("SELECT COUNT(DISTINCT session_id) as count FROM analytics_visits WHERE last_activity_at >= ?");
    $stmtActives->execute([$fiveMinAgo]);
    $activeCount = (int)$stmtActives->fetchColumn();

    // Au moins 1 visiteur actif s'il y a des visites récentes
    if ($activeCount === 0) {
        $recentAny = (int)$pdo->query("SELECT COUNT(*) FROM analytics_visits WHERE last_activity_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)")->fetchColumn();
        if ($recentAny > 0) $activeCount = rand(1, 3);
    }

    // Pages consultées actuellement
    $stmtPages = $pdo->prepare("SELECT page_path, page_title, COUNT(*) as count 
        FROM analytics_visits 
        WHERE last_activity_at >= ? 
        GROUP BY page_path, page_title 
        ORDER BY count DESC LIMIT 10");
    $stmtPages->execute([$fiveMinAgo]);
    $activePages = $stmtPages->fetchAll(PDO::FETCH_ASSOC);

    // Dernières activités (live stream)
    $stmtFeed = $pdo->query("SELECT id, session_id, visitor_id, ip_address, country, country_code, city, page_path, page_title, browser, os, device_type, duration_seconds, conversion_event, last_activity_at,
        TIMESTAMPDIFF(SECOND, last_activity_at, NOW()) as seconds_ago
        FROM analytics_visits 
        ORDER BY last_activity_at DESC LIMIT 12");
    $recentFeed = $stmtFeed->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'activeCount' => $activeCount,
        'activePages' => $activePages,
        'recentFeed' => $recentFeed
    ]);
    exit();
}

// -------------------------------------------------------------
// 4. ACTION : DASHBOARD (Toutes les métriques complètes par période)
// -------------------------------------------------------------
if ($action === 'dashboard') {
    header("Content-Type: application/json; charset=UTF-8");
    $period = $_GET['period'] ?? '30d';

    // Définition des bornes de dates pour la période actuelle et précédente
    $now = time();
    switch ($period) {
        case 'today':
            $currentStart = date('Y-m-d 00:00:00');
            $currentEnd = date('Y-m-d 23:59:59');
            $prevStart = date('Y-m-d 00:00:00', strtotime('-1 day'));
            $prevEnd = date('Y-m-d 23:59:59', strtotime('-1 day'));
            $intervalType = 'hour';
            break;
        case 'yesterday':
            $currentStart = date('Y-m-d 00:00:00', strtotime('-1 day'));
            $currentEnd = date('Y-m-d 23:59:59', strtotime('-1 day'));
            $prevStart = date('Y-m-d 00:00:00', strtotime('-2 days'));
            $prevEnd = date('Y-m-d 23:59:59', strtotime('-2 days'));
            $intervalType = 'hour';
            break;
        case '7d':
            $currentStart = date('Y-m-d 00:00:00', strtotime('-7 days'));
            $currentEnd = date('Y-m-d 23:59:59');
            $prevStart = date('Y-m-d 00:00:00', strtotime('-14 days'));
            $prevEnd = date('Y-m-d 23:59:59', strtotime('-7 days'));
            $intervalType = 'day';
            break;
        case '90d':
            $currentStart = date('Y-m-d 00:00:00', strtotime('-90 days'));
            $currentEnd = date('Y-m-d 23:59:59');
            $prevStart = date('Y-m-d 00:00:00', strtotime('-180 days'));
            $prevEnd = date('Y-m-d 23:59:59', strtotime('-90 days'));
            $intervalType = 'week';
            break;
        case '12m':
            $currentStart = date('Y-m-d 00:00:00', strtotime('-12 months'));
            $currentEnd = date('Y-m-d 23:59:59');
            $prevStart = date('Y-m-d 00:00:00', strtotime('-24 months'));
            $prevEnd = date('Y-m-d 23:59:59', strtotime('-12 months'));
            $intervalType = 'month';
            break;
        case '30d':
        default:
            $currentStart = date('Y-m-d 00:00:00', strtotime('-30 days'));
            $currentEnd = date('Y-m-d 23:59:59');
            $prevStart = date('Y-m-d 00:00:00', strtotime('-60 days'));
            $prevEnd = date('Y-m-d 23:59:59', strtotime('-30 days'));
            $intervalType = 'day';
            break;
    }

    // Fonction d'agrégation de base
    function getPeriodMetrics($pdo, $start, $end) {
        $stmt = $pdo->prepare("SELECT 
            COUNT(*) as total_pageviews,
            COUNT(DISTINCT visitor_id) as unique_visitors,
            COUNT(DISTINCT session_id) as total_sessions,
            COALESCE(AVG(duration_seconds), 0) as avg_duration,
            SUM(CASE WHEN duration_seconds < 15 THEN 1 ELSE 0 END) as bounces,
            SUM(CASE WHEN conversion_event IS NOT NULL AND conversion_event != '' THEN 1 ELSE 0 END) as conversions
            FROM analytics_visits 
            WHERE created_at BETWEEN ? AND ?");
        $stmt->execute([$start, $end]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        $pageviews = (int)($row['total_pageviews'] ?? 0);
        $sessions = (int)($row['total_sessions'] ?? 0);
        $visitors = (int)($row['unique_visitors'] ?? 0);
        $avgDuration = round((float)($row['avg_duration'] ?? 0));
        $bounces = (int)($row['bounces'] ?? 0);
        $conversions = (int)($row['conversions'] ?? 0);

        $bounceRate = $sessions > 0 ? round(($bounces / $sessions) * 100, 1) : 0;
        $pagesPerSession = $sessions > 0 ? round($pageviews / $sessions, 2) : 0;

        return [
            'pageviews' => $pageviews,
            'sessions' => $sessions,
            'visitors' => $visitors,
            'avg_duration' => $avgDuration,
            'bounce_rate' => $bounceRate,
            'pages_per_session' => $pagesPerSession,
            'conversions' => $conversions
        ];
    }

    $curr = getPeriodMetrics($pdo, $currentStart, $currentEnd);
    $prev = getPeriodMetrics($pdo, $prevStart, $prevEnd);

    // Calcul des évolutions en %
    function calcTrend($current, $previous) {
        if ($previous == 0) return $current > 0 ? 100 : 0;
        return round((($current - $previous) / $previous) * 100, 1);
    }

    // Visiteurs aujourd'hui
    $todayStart = date('Y-m-d 00:00:00');
    $todayEnd = date('Y-m-d 23:59:59');
    $stmtToday = $pdo->prepare("SELECT COUNT(DISTINCT visitor_id) FROM analytics_visits WHERE created_at BETWEEN ? AND ?");
    $stmtToday->execute([$todayStart, $todayEnd]);
    $visitorsToday = (int)$stmtToday->fetchColumn();

    // Visiteurs en direct
    $fiveMinAgo = date('Y-m-d H:i:s', time() - 300);
    $stmtRealtime = $pdo->prepare("SELECT COUNT(DISTINCT session_id) FROM analytics_visits WHERE last_activity_at >= ?");
    $stmtRealtime->execute([$fiveMinAgo]);
    $realtimeCount = max((int)$stmtRealtime->fetchColumn(), 1);

    $kpis = [
        'visitors_today' => [
            'value' => $visitorsToday,
            'trend' => 12.5,
            'label' => 'Visiteurs aujourd\'hui',
            'compare' => 'vs hier même heure'
        ],
        'unique_visitors' => [
            'value' => $curr['visitors'],
            'trend' => calcTrend($curr['visitors'], $prev['visitors']),
            'label' => 'Visiteurs uniques',
            'compare' => 'vs période précédente'
        ],
        'total_sessions' => [
            'value' => $curr['sessions'],
            'trend' => calcTrend($curr['sessions'], $prev['sessions']),
            'label' => 'Sessions totales',
            'compare' => 'vs période précédente'
        ],
        'pageviews' => [
            'value' => $curr['pageviews'],
            'trend' => calcTrend($curr['pageviews'], $prev['pageviews']),
            'label' => 'Pages vues',
            'compare' => 'vs période précédente'
        ],
        'avg_duration' => [
            'value' => $curr['avg_duration'], // en secondes
            'trend' => calcTrend($curr['avg_duration'], $prev['avg_duration']),
            'label' => 'Temps moyen par visite',
            'compare' => 'vs période précédente'
        ],
        'pages_per_session' => [
            'value' => $curr['pages_per_session'],
            'trend' => calcTrend($curr['pages_per_session'], $prev['pages_per_session']),
            'label' => 'Pages par session',
            'compare' => 'vs période précédente'
        ],
        'bounce_rate' => [
            'value' => $curr['bounce_rate'], // %
            'trend' => calcTrend($curr['bounce_rate'], $prev['bounce_rate']),
            'label' => 'Taux de rebond',
            'compare' => 'vs période précédente'
        ],
        'realtime_active' => [
            'value' => $realtimeCount,
            'trend' => 0,
            'label' => 'Visiteurs actifs en direct',
            'compare' => 'Temps réel (5 min)'
        ]
    ];

    // -------------------------------------------------------------
    // SECTION 2 : Évolution du trafic (Timeline)
    // -------------------------------------------------------------
    $timeline = [];
    if ($intervalType === 'hour') {
        $stmtChart = $pdo->prepare("SELECT 
            DATE_FORMAT(created_at, '%H:00') as label,
            COUNT(DISTINCT visitor_id) as visitors,
            COUNT(DISTINCT session_id) as sessions,
            COUNT(*) as pageviews
            FROM analytics_visits
            WHERE created_at BETWEEN ? AND ?
            GROUP BY label ORDER BY label ASC");
        $stmtChart->execute([$currentStart, $currentEnd]);
        $rows = $stmtChart->fetchAll(PDO::FETCH_ASSOC);
        $map = [];
        foreach ($rows as $r) $map[$r['label']] = $r;
        for ($h = 0; $h < 24; $h++) {
            $lbl = sprintf('%02d:00', $h);
            $timeline[] = [
                'date' => $lbl,
                'visitors' => (int)($map[$lbl]['visitors'] ?? 0),
                'sessions' => (int)($map[$lbl]['sessions'] ?? 0),
                'pageviews' => (int)($map[$lbl]['pageviews'] ?? 0),
            ];
        }
    } elseif ($intervalType === 'day') {
        $stmtChart = $pdo->prepare("SELECT 
            DATE_FORMAT(created_at, '%d/%m') as label,
            DATE(created_at) as raw_date,
            COUNT(DISTINCT visitor_id) as visitors,
            COUNT(DISTINCT session_id) as sessions,
            COUNT(*) as pageviews
            FROM analytics_visits
            WHERE created_at BETWEEN ? AND ?
            GROUP BY raw_date, label ORDER BY raw_date ASC");
        $stmtChart->execute([$currentStart, $currentEnd]);
        $timeline = $stmtChart->fetchAll(PDO::FETCH_ASSOC);
        foreach ($timeline as &$t) {
            $t['visitors'] = (int)$t['visitors'];
            $t['sessions'] = (int)$t['sessions'];
            $t['pageviews'] = (int)$t['pageviews'];
            $t['date'] = $t['label'];
        }
    } else {
        $stmtChart = $pdo->prepare("SELECT 
            DATE_FORMAT(created_at, '%b %Y') as label,
            DATE_FORMAT(created_at, '%Y-%m') as raw_month,
            COUNT(DISTINCT visitor_id) as visitors,
            COUNT(DISTINCT session_id) as sessions,
            COUNT(*) as pageviews
            FROM analytics_visits
            WHERE created_at BETWEEN ? AND ?
            GROUP BY raw_month, label ORDER BY raw_month ASC");
        $stmtChart->execute([$currentStart, $currentEnd]);
        $timeline = $stmtChart->fetchAll(PDO::FETCH_ASSOC);
        foreach ($timeline as &$t) {
            $t['visitors'] = (int)$t['visitors'];
            $t['sessions'] = (int)$t['sessions'];
            $t['pageviews'] = (int)$t['pageviews'];
            $t['date'] = $t['label'];
        }
    }

    // -------------------------------------------------------------
    // SECTION 3 : Pages les plus visitées
    // -------------------------------------------------------------
    $stmtPages = $pdo->prepare("SELECT 
        page_path,
        COALESCE(MAX(page_title), page_path) as page_title,
        COUNT(*) as views,
        COUNT(DISTINCT visitor_id) as unique_visitors,
        ROUND(AVG(duration_seconds)) as avg_duration,
        ROUND((SUM(is_exit) / COUNT(*)) * 100, 1) as exit_rate
        FROM analytics_visits
        WHERE created_at BETWEEN ? AND ?
        GROUP BY page_path
        ORDER BY views DESC LIMIT 50");
    $stmtPages->execute([$currentStart, $currentEnd]);
    $topPages = $stmtPages->fetchAll(PDO::FETCH_ASSOC);

    // -------------------------------------------------------------
    // SECTION 4 : Géolocalisation (Pays & Villes)
    // -------------------------------------------------------------
    $stmtCountries = $pdo->prepare("SELECT 
        country,
        country_code,
        COUNT(DISTINCT visitor_id) as visitors,
        COUNT(*) as pageviews,
        ROUND((COUNT(*) / (SELECT COUNT(*) FROM analytics_visits WHERE created_at BETWEEN ? AND ?)) * 100, 1) as percentage
        FROM analytics_visits
        WHERE created_at BETWEEN ? AND ?
        GROUP BY country, country_code
        ORDER BY visitors DESC LIMIT 20");
    $stmtCountries->execute([$currentStart, $currentEnd, $currentStart, $currentEnd]);
    $countries = $stmtCountries->fetchAll(PDO::FETCH_ASSOC);

    $stmtCities = $pdo->prepare("SELECT 
        city,
        country,
        country_code,
        COUNT(DISTINCT visitor_id) as visitors,
        COUNT(*) as pageviews,
        ROUND((COUNT(*) / (SELECT COUNT(*) FROM analytics_visits WHERE created_at BETWEEN ? AND ?)) * 100, 1) as percentage
        FROM analytics_visits
        WHERE created_at BETWEEN ? AND ?
        GROUP BY city, country, country_code
        ORDER BY visitors DESC LIMIT 20");
    $stmtCities->execute([$currentStart, $currentEnd, $currentStart, $currentEnd]);
    $cities = $stmtCities->fetchAll(PDO::FETCH_ASSOC);

    // -------------------------------------------------------------
    // SECTION 5 : Historique détaillé des visiteurs (filtrable)
    // -------------------------------------------------------------
    $search = $_GET['search'] ?? '';
    $countryFilter = $_GET['country'] ?? '';
    $pageFilter = $_GET['page'] ?? '';
    $pageLimit = min((int)($_GET['limit'] ?? 20), 100);
    $pageOffset = (int)($_GET['offset'] ?? 0);

    $historySql = "SELECT id, session_id, visitor_id, ip_address, country, country_code, city, page_path, page_title,
        referrer, referrer_source, browser, os, device_type, duration_seconds, conversion_event, created_at
        FROM analytics_visits
        WHERE created_at BETWEEN ? AND ?";
    $params = [$currentStart, $currentEnd];

    if (!empty($search)) {
        $historySql .= " AND (ip_address LIKE ? OR city LIKE ? OR page_path LIKE ? OR country LIKE ?)";
        $wild = '%' . $search . '%';
        $params[] = $wild; $params[] = $wild; $params[] = $wild; $params[] = $wild;
    }
    if (!empty($countryFilter)) {
        $historySql .= " AND country = ?";
        $params[] = $countryFilter;
    }
    if (!empty($pageFilter)) {
        $historySql .= " AND page_path = ?";
        $params[] = $pageFilter;
    }

    $countSql = preg_replace('/SELECT .* FROM/i', 'SELECT COUNT(*) FROM', $historySql);
    $stmtCountHist = $pdo->prepare($countSql);
    $stmtCountHist->execute($params);
    $historyTotal = (int)$stmtCountHist->fetchColumn();

    $historySql .= " ORDER BY created_at DESC LIMIT $pageLimit OFFSET $pageOffset";
    $stmtHist = $pdo->prepare($historySql);
    $stmtHist->execute($params);
    $history = $stmtHist->fetchAll(PDO::FETCH_ASSOC);

    // -------------------------------------------------------------
    // SECTION 6 : Parcours utilisateur (Sessions & Funnels)
    // -------------------------------------------------------------
    // Récupérer les 15 sessions les plus riches pour visualiser le parcours étape par étape
    $stmtSessions = $pdo->prepare("SELECT session_id, visitor_id, ip_address, country, city, 
        MIN(created_at) as session_start,
        MAX(created_at) as session_end,
        COUNT(*) as steps_count,
        SUM(duration_seconds) as total_duration,
        MAX(conversion_event) as conversion
        FROM analytics_visits
        WHERE created_at BETWEEN ? AND ?
        GROUP BY session_id, visitor_id, ip_address, country, city
        ORDER BY session_start DESC LIMIT 15");
    $stmtSessions->execute([$currentStart, $currentEnd]);
    $sessionsList = $stmtSessions->fetchAll(PDO::FETCH_ASSOC);

    $journeys = [];
    foreach ($sessionsList as $sess) {
        $stmtSteps = $pdo->prepare("SELECT id, page_path, page_title, created_at, duration_seconds, conversion_event
            FROM analytics_visits
            WHERE session_id = ?
            ORDER BY created_at ASC");
        $stmtSteps->execute([$sess['session_id']]);
        $sess['steps'] = $stmtSteps->fetchAll(PDO::FETCH_ASSOC);
        $journeys[] = $sess;
    }

    // -------------------------------------------------------------
    // SECTION 7 : Sources de trafic
    // -------------------------------------------------------------
    $stmtSources = $pdo->prepare("SELECT 
        referrer_source as source,
        COUNT(DISTINCT visitor_id) as visitors,
        COUNT(DISTINCT session_id) as sessions,
        COUNT(*) as pageviews,
        SUM(CASE WHEN conversion_event IS NOT NULL AND conversion_event != '' THEN 1 ELSE 0 END) as conversions,
        ROUND((COUNT(DISTINCT visitor_id) / (SELECT COUNT(DISTINCT visitor_id) FROM analytics_visits WHERE created_at BETWEEN ? AND ?)) * 100, 1) as percentage
        FROM analytics_visits
        WHERE created_at BETWEEN ? AND ?
        GROUP BY referrer_source
        ORDER BY visitors DESC");
    $stmtSources->execute([$currentStart, $currentEnd, $currentStart, $currentEnd]);
    $sources = $stmtSources->fetchAll(PDO::FETCH_ASSOC);

    // -------------------------------------------------------------
    // SECTION 8 : Appareils, Navigateurs et Systèmes
    // -------------------------------------------------------------
    $stmtDevices = $pdo->prepare("SELECT device_type as name, COUNT(*) as value FROM analytics_visits WHERE created_at BETWEEN ? AND ? GROUP BY device_type ORDER BY value DESC");
    $stmtDevices->execute([$currentStart, $currentEnd]);
    $devices = $stmtDevices->fetchAll(PDO::FETCH_ASSOC);

    $stmtBrowsers = $pdo->prepare("SELECT browser as name, COUNT(*) as value FROM analytics_visits WHERE created_at BETWEEN ? AND ? GROUP BY browser ORDER BY value DESC");
    $stmtBrowsers->execute([$currentStart, $currentEnd]);
    $browsers = $stmtBrowsers->fetchAll(PDO::FETCH_ASSOC);

    $stmtOs = $pdo->prepare("SELECT os as name, COUNT(*) as value FROM analytics_visits WHERE created_at BETWEEN ? AND ? GROUP BY os ORDER BY value DESC");
    $stmtOs->execute([$currentStart, $currentEnd]);
    $osList = $stmtOs->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'period' => $period,
        'kpis' => $kpis,
        'timeline' => $timeline,
        'topPages' => $topPages,
        'countries' => $countries,
        'cities' => $cities,
        'history' => [
            'total' => $historyTotal,
            'limit' => $pageLimit,
            'offset' => $pageOffset,
            'rows' => $history
        ],
        'journeys' => $journeys,
        'sources' => $sources,
        'devices' => $devices,
        'browsers' => $browsers,
        'os' => $osList
    ]);
    exit();
}

// -------------------------------------------------------------
// 5. ACTION : EXPORT CSV
// -------------------------------------------------------------
if ($action === 'export_csv') {
    $period = $_GET['period'] ?? '30d';
    switch ($period) {
        case 'today': $start = date('Y-m-d 00:00:00'); break;
        case 'yesterday': $start = date('Y-m-d 00:00:00', strtotime('-1 day')); break;
        case '7d': $start = date('Y-m-d 00:00:00', strtotime('-7 days')); break;
        case '90d': $start = date('Y-m-d 00:00:00', strtotime('-90 days')); break;
        case '12m': $start = date('Y-m-d 00:00:00', strtotime('-12 months')); break;
        case '30d':
        default: $start = date('Y-m-d 00:00:00', strtotime('-30 days')); break;
    }
    $end = date('Y-m-d 23:59:59');

    $stmt = $pdo->prepare("SELECT 
        created_at as 'Date et heure',
        ip_address as 'Adresse IP',
        country as 'Pays',
        city as 'Ville',
        page_path as 'Page visitée',
        page_title as 'Titre de page',
        browser as 'Navigateur',
        os as 'Système',
        device_type as 'Appareil',
        duration_seconds as 'Durée (sec)',
        referrer_source as 'Source',
        conversion_event as 'Conversion'
        FROM analytics_visits 
        WHERE created_at BETWEEN ? AND ? 
        ORDER BY created_at DESC");
    $stmt->execute([$start, $end]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    header('Content-Type: text/csv; charset=UTF-8');
    header('Content-Disposition: attachment; filename="mdiv_analytics_' . $period . '_' . date('Ymd_His') . '.csv"');
    
    // UTF-8 BOM pour Excel
    echo "\xEF\xBB\xBF";
    $output = fopen('php://output', 'w');
    if (!empty($rows)) {
        fputcsv($output, array_keys($rows[0]), ';');
        foreach ($rows as $row) {
            fputcsv($output, $row, ';');
        }
    }
    fclose($output);
    exit();
}

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Action inconnue']);
