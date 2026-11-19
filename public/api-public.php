<?php
// api-public.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'api-config.php';

$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($action === 'videos') {
    $stmt = $pdo->query("SELECT id, title, youtube_id as youtubeId, category FROM videos ORDER BY created_at DESC");
    echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
    exit();
}

if ($action === 'events') {
    $type = isset($_GET['type']) ? $_GET['type'] : null;
    $typeFilter = $type ? " AND e.type = " . $pdo->quote($type) : "";
    
    // Vérification résiliente de la présence de la table event_attendees
    $hasAttendees = false;
    try {
        $pdo->query("SELECT 1 FROM event_attendees LIMIT 1");
        $hasAttendees = true;
    } catch (Throwable $t) {}

    $countSubquery = $hasAttendees 
        ? "(SELECT COUNT(*) FROM event_attendees ea WHERE ea.event_id = e.id AND ea.status != 'cancelled') as attendees_count"
        : "0 as attendees_count";

    // upcoming
    $stmtUp = $pdo->query("SELECT e.*, $countSubquery FROM events e WHERE e.date >= NOW() $typeFilter ORDER BY e.date ASC");
    $upcoming = $stmtUp->fetchAll();
    
    // past
    $stmtPast = $pdo->query("SELECT e.*, $countSubquery FROM events e WHERE e.date < NOW() $typeFilter ORDER BY e.date DESC");
    $past = $stmtPast->fetchAll();
    
    // Décodage de features_config et conversion de attendees_count
    foreach ($upcoming as &$ev) {
        if (isset($ev['features_config']) && is_string($ev['features_config'])) {
            $ev['features_config'] = json_decode($ev['features_config'], true) ?: [];
        }
        $ev['attendees_count'] = intval($ev['attendees_count'] ?? 0);
    }
    unset($ev);

    foreach ($past as &$ev) {
        if (isset($ev['features_config']) && is_string($ev['features_config'])) {
            $ev['features_config'] = json_decode($ev['features_config'], true) ?: [];
        }
        $ev['attendees_count'] = intval($ev['attendees_count'] ?? 0);
    }
    unset($ev);

    echo json_encode([
        'success' => true,
        'data' => [
            'upcoming' => $upcoming,
            'past' => $past
        ]
    ]);
    exit();
}

if ($action === 'members') {
    $stmt = $pdo->query("SELECT * FROM members ORDER BY created_at ASC");
    echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
    exit();
}

if ($action === 'partners') {
    $stmt = $pdo->query("SELECT * FROM partners ORDER BY created_at ASC");
    echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
    exit();
}

if ($action === 'reviews') {
    $stmt = $pdo->query("SELECT id, nom as name, role, commentaire as quote, pays as country, note as rating, evenement as event FROM avis ORDER BY date_creation DESC");
    echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
    exit();
}

if ($action === 'ambassadors') {
    $stmt = $pdo->query("SELECT * FROM ambassadors ORDER BY country ASC");
    echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
    exit();
}

if ($action === 'submit_application' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data) {
        http_response_code(400); echo json_encode(['success' => false, 'error' => 'Données invalides']); exit();
    }
    
    $type = $data['type'] ?? 'unknown';
    $formData = json_encode($data['data'] ?? []);
    
    $stmt = $pdo->prepare("INSERT INTO applications (type, data) VALUES (?, ?)");
    if ($stmt->execute([$type, $formData])) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500); echo json_encode(['success' => false, 'error' => 'Erreur BDD']);
    }
    exit();
}

if ($action === 'site_stats') {
    try {
        $stmt = $pdo->query("SELECT * FROM site_stats WHERE id = 1");
        if ($stmt) {
            $stats = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($stats) {
                echo json_encode(['success' => true, 'data' => $stats]);
                exit();
            }
        }
    } catch (PDOException $e) {
        // Table doesn't exist yet or other error, fallback to defaults
    }
    
    // Default values if table doesn't exist
    $defaultStats = [
        'ambassadors_count' => 0,
        'partners_count' => 0,
        'events_count' => 0,
        'trips_count' => 0,
        'participants_count' => 0,
        'members_count' => 10,
        'countries_count' => 4,
        'satisfaction_rate' => '87%'
    ];
    echo json_encode(['success' => true, 'data' => $defaultStats]);
    exit();
}

if ($action === 'hero_news') {
    try {
        $stmt = $pdo->query("SELECT * FROM hero_news WHERE is_active = 1 ORDER BY order_num ASC, created_at DESC");
        $rawNews = $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];
        
        // Dédoublonnage strict par titre et nettoyage automatique des doublons dans la BDD
        $news = [];
        $seenTitles = [];
        foreach ($rawNews as $item) {
            $key = mb_strtolower(trim($item['title']));
            if (!isset($seenTitles[$key])) {
                $seenTitles[$key] = true;
                // Nettoyage des balises HTML du commentaire
                $cleanComment = trim(strip_tags(html_entity_decode($item['comment'], ENT_QUOTES | ENT_HTML5, 'UTF-8')));
                $item['comment'] = preg_replace('/\s+/', ' ', $cleanComment);
                $news[] = $item;
            } else {
                // Purge du doublon dans la base de données
                try {
                    $delDup = $pdo->prepare("DELETE FROM hero_news WHERE id = ?");
                    $delDup->execute([$item['id']]);
                } catch (Exception $e) {}
            }
        }
        if (count($news) === 0) {
            // Fallback si la table vient d'être créée ou est vide
            $news = [
                [
                    'id' => 1,
                    'title' => "Sommet BNE Casablanca 2026 : 450 Dirigeants Réunis",
                    'comment' => "La plus grande rencontre d'affaires inter-entreprises du continent africain avec signature de partenariats stratégiques majeurs.",
                    'image_url' => "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
                    'link_url' => "/evenements",
                    'tag' => "Événement Majeur",
                    'order_num' => 1,
                    'is_active' => 1
                ],
                [
                    'id' => 2,
                    'title' => "Mission Économique & Immersion BNE à Abidjan",
                    'comment' => "Accélération des opportunités d'investissement, rencontres B2B qualifiées par IA et visites de sites industriels phares.",
                    'image_url' => "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
                    'link_url' => "/sejours-bne",
                    'tag' => "Séjour Immersif",
                    'order_num' => 2,
                    'is_active' => 1
                ],
                [
                    'id' => 3,
                    'title' => "Intelligence Artificielle & Alliances Transfrontalières",
                    'comment' => "Déploiement de notre infrastructure d'intelligence décisionnelle pour connecter les décideurs d'Europe et d'Afrique.",
                    'image_url' => "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
                    'link_url' => "/services-ia",
                    'tag' => "Stratégie & IA",
                    'order_num' => 3,
                    'is_active' => 1
                ]
            ];
        }
        echo json_encode(['success' => true, 'data' => $news]);
    } catch (PDOException $e) {
        echo json_encode(['success' => true, 'data' => []]);
    }
    exit();
}

if ($action === 'blog_articles') {
    try {
        $stmt = $pdo->query("SELECT * FROM blog_articles ORDER BY is_featured DESC, created_at DESC");
        $articles = $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];
        foreach ($articles as &$art) {
            if (isset($art['tags']) && is_string($art['tags'])) {
                $art['tags'] = json_decode($art['tags'], true) ?: [];
            }
            if (isset($art['sections']) && is_string($art['sections'])) {
                $art['sections'] = json_decode($art['sections'], true) ?: [];
            }
        }
        echo json_encode(['success' => true, 'data' => $articles]);
    } catch (PDOException $e) {
        echo json_encode(['success' => true, 'data' => []]);
    }
    exit();
}

if ($action === 'blog_article') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    try {
        $stmt = $pdo->prepare("SELECT * FROM blog_articles WHERE id = ?");
        $stmt->execute([$id]);
        $article = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($article) {
            if (isset($article['tags']) && is_string($article['tags'])) {
                $article['tags'] = json_decode($article['tags'], true) ?: [];
            }
            if (isset($article['sections']) && is_string($article['sections'])) {
                $article['sections'] = json_decode($article['sections'], true) ?: [];
            }
            echo json_encode(['success' => true, 'data' => $article]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Article introuvable']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit();
}

if ($action === 'tombola_prizes' || $action === 'tombola_public') {
    $eventId = isset($_GET['event_id']) ? intval($_GET['event_id']) : 0;
    
    // Auto-migration résiliente au cas où la table n'a pas encore été migrée
    try {
        $cols = [];
        $res = $pdo->query("SHOW COLUMNS FROM `event_tombola_prizes`");
        if ($res) {
            while ($r = $res->fetch(PDO::FETCH_ASSOC)) {
                $cols[] = strtolower($r['Field']);
            }
        }
        if (!in_array('is_active', $cols)) {
            $pdo->exec("ALTER TABLE `event_tombola_prizes` ADD COLUMN `is_active` TINYINT(1) NOT NULL DEFAULT 1");
        }
        if (!in_array('value', $cols)) {
            $pdo->exec("ALTER TABLE `event_tombola_prizes` ADD COLUMN `value` VARCHAR(100) NULL DEFAULT NULL");
        }
        if (!in_array('draw_rank', $cols)) {
            $pdo->exec("ALTER TABLE `event_tombola_prizes` ADD COLUMN `draw_rank` VARCHAR(100) NULL DEFAULT '1er Prix'");
        }
        if (!in_array('images', $cols)) {
            $pdo->exec("ALTER TABLE `event_tombola_prizes` ADD COLUMN `images` TEXT NULL");
        }
    } catch (Throwable $t) {}

    try {
        if ($eventId > 0) {
            $stmt = $pdo->prepare("SELECT p.*, e.title as event_title, e.date as event_date, COALESCE(e.location, '') as event_location 
                                   FROM event_tombola_prizes p 
                                   LEFT JOIN events e ON e.id = p.event_id 
                                   WHERE p.event_id = ? AND (p.is_active = 1 OR p.is_active IS NULL) 
                                   ORDER BY p.sort_order ASC, p.id ASC");
            $stmt->execute([$eventId]);
        } else {
            // Tous les lots actifs (priorité aux événements futurs puis récents)
            $stmt = $pdo->query("SELECT p.*, e.title as event_title, e.date as event_date, COALESCE(e.location, '') as event_location 
                                 FROM event_tombola_prizes p 
                                 LEFT JOIN events e ON e.id = p.event_id 
                                 WHERE (p.is_active = 1 OR p.is_active IS NULL) 
                                 ORDER BY e.date DESC, p.sort_order ASC, p.id ASC");
        }
        $prizes = $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];
        foreach ($prizes as &$pz) {
            $pz['id'] = intval($pz['id']);
            $pz['event_id'] = intval($pz['event_id']);
            $pz['winners_count'] = intval($pz['winners_count'] ?? 1);
            $pz['quantity'] = $pz['winners_count'];
            $pz['drawn_count'] = intval($pz['drawn_count'] ?? 0);
            $pz['is_drawn'] = (bool)($pz['is_drawn'] ?? 0);
            $pz['is_active'] = 1;
            $pz['draw_rank'] = $pz['draw_rank'] ?? '1er Prix';
            $pz['value'] = $pz['value'] ?? '';
            if (isset($pz['images']) && is_string($pz['images']) && trim($pz['images']) !== '') {
                $decoded = json_decode($pz['images'], true);
                $pz['images'] = is_array($decoded) ? $decoded : ($pz['image_url'] ? [$pz['image_url']] : []);
            } else {
                $pz['images'] = !empty($pz['image_url']) ? [$pz['image_url']] : [];
            }
        }
        unset($pz);
        echo json_encode(['success' => true, 'data' => $prizes]);
    } catch (Throwable $e) {
        // En cas de repli si la table n'a pas encore toutes les colonnes
        try {
            $fallbackStmt = $pdo->query("SELECT p.*, e.title as event_title, e.date as event_date, COALESCE(e.location, '') as event_location 
                                         FROM event_tombola_prizes p 
                                         LEFT JOIN events e ON e.id = p.event_id 
                                         ORDER BY p.id ASC");
            $fallbackPrizes = $fallbackStmt ? $fallbackStmt->fetchAll(PDO::FETCH_ASSOC) : [];
            echo json_encode(['success' => true, 'data' => $fallbackPrizes]);
        } catch (Throwable $t2) {
            echo json_encode(['success' => true, 'data' => []]);
        }
    }
    exit();
}

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Action inconnue']);

