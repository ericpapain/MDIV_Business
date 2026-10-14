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
    $typeFilter = $type ? " AND type = " . $pdo->quote($type) : "";
    
    // upcoming
    $stmtUp = $pdo->query("SELECT * FROM events WHERE date >= NOW() $typeFilter ORDER BY date ASC");
    $upcoming = $stmtUp->fetchAll();
    
    // past
    $stmtPast = $pdo->query("SELECT * FROM events WHERE date < NOW() $typeFilter ORDER BY date DESC");
    $past = $stmtPast->fetchAll();
    
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
        $news = $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];
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

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Action inconnue']);

