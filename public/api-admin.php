<?php
// api-admin.php
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

// Protection de l'API
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Non autorisé']);
    exit();
}

$action = isset($_GET['action']) ? $_GET['action'] : '';
$data = json_decode(file_get_contents("php://input"));

// Création des tables si elles n'existent pas
$pdo->exec("CREATE TABLE IF NOT EXISTS videos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    youtube_id VARCHAR(50),
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

$pdo->exec("CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    title_en VARCHAR(255),
    date DATETIME,
    location VARCHAR(255),
    description TEXT,
    description_en TEXT,
    image_url VARCHAR(255),
    type VARCHAR(50),
    price VARCHAR(100),
    billetterie_url VARCHAR(500),
    program TEXT,
    status VARCHAR(50) DEFAULT 'upcoming',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

// Migration: ajouter les colonnes si elles n'existent pas (compatible MySQL 5.x+)
try { $pdo->exec("ALTER TABLE events ADD COLUMN price VARCHAR(100) DEFAULT NULL"); } catch(PDOException $e) {}
try { $pdo->exec("ALTER TABLE events ADD COLUMN title_en VARCHAR(255) DEFAULT NULL"); } catch(PDOException $e) {}
try { $pdo->exec("ALTER TABLE events ADD COLUMN description_en TEXT DEFAULT NULL"); } catch(PDOException $e) {}
try { $pdo->exec("ALTER TABLE events ADD COLUMN billetterie_url VARCHAR(500) DEFAULT NULL"); } catch(PDOException $e) {}
try { $pdo->exec("ALTER TABLE events ADD COLUMN program TEXT DEFAULT NULL"); } catch(PDOException $e) {}
try { $pdo->exec("ALTER TABLE events ADD COLUMN replay_data TEXT DEFAULT NULL"); } catch(PDOException $e) {}
try { $pdo->exec("ALTER TABLE events ADD COLUMN event_code VARCHAR(50) DEFAULT NULL"); } catch(PDOException $e) {}

$pdo->exec("CREATE TABLE IF NOT EXISTS members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    role VARCHAR(255),
    image_url VARCHAR(255),
    flag VARCHAR(10),
    countryCode VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

$pdo->exec("CREATE TABLE IF NOT EXISTS partners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    category VARCHAR(100),
    country VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

// Migration: enrichir la table partners
try { $pdo->exec("ALTER TABLE partners ADD COLUMN logo_url VARCHAR(255) DEFAULT NULL"); } catch(PDOException $e) {}
try { $pdo->exec("ALTER TABLE partners ADD COLUMN flag VARCHAR(20) DEFAULT NULL"); } catch(PDOException $e) {}
try { $pdo->exec("ALTER TABLE partners ADD COLUMN sector VARCHAR(255) DEFAULT NULL"); } catch(PDOException $e) {}
try { $pdo->exec("ALTER TABLE partners ADD COLUMN website VARCHAR(500) DEFAULT NULL"); } catch(PDOException $e) {}

// Table Ambassadeurs
$pdo->exec("CREATE TABLE IF NOT EXISTS ambassadors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    country VARCHAR(255) NOT NULL,
    flag VARCHAR(20) DEFAULT '',
    zone VARCHAR(255) DEFAULT '',
    expertises TEXT DEFAULT '',
    logo_url VARCHAR(255) DEFAULT '',
    company VARCHAR(255) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

// Migration: add company to ambassadors if missing
try { $pdo->exec("ALTER TABLE ambassadors ADD COLUMN company VARCHAR(255) DEFAULT ''"); } catch(PDOException $e) {}

$pdo->exec("CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    role VARCHAR(255),
    quote TEXT,
    flagType VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

$pdo->exec("CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending',
    data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

// Table des statistiques globales du site
$pdo->exec("CREATE TABLE IF NOT EXISTS site_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ambassadors_count INT DEFAULT 0,
    partners_count INT DEFAULT 0,
    events_count INT DEFAULT 0,
    trips_count INT DEFAULT 0,
    participants_count INT DEFAULT 0,
    members_count INT DEFAULT 10,
    countries_count INT DEFAULT 4,
    satisfaction_rate VARCHAR(50) DEFAULT '87%',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

// Initialisation de la ligne par défaut si la table est vide
$stats_count = $pdo->query("SELECT COUNT(*) FROM site_stats")->fetchColumn();
if ($stats_count == 0) {
    $pdo->exec("INSERT INTO site_stats (id, ambassadors_count, partners_count, events_count, trips_count, participants_count, members_count, countries_count, satisfaction_rate) VALUES (1, 0, 0, 0, 0, 0, 10, 4, '87%')");
}

// Table des Actualités Hero
$pdo->exec("CREATE TABLE IF NOT EXISTS hero_news (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    comment TEXT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    link_url VARCHAR(500) DEFAULT NULL,
    tag VARCHAR(100) DEFAULT 'Actualité Principale',
    order_num INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

try {
    $news_count = $pdo->query("SELECT COUNT(*) FROM hero_news")->fetchColumn();
    if ($news_count == 0) {
        $stmtSeed = $pdo->prepare("INSERT INTO hero_news (title, comment, image_url, link_url, tag, order_num, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmtSeed->execute([
            "Sommet BNE Casablanca 2026 : 450 Dirigeants Réunis",
            "La plus grande rencontre d'affaires inter-entreprises du continent africain avec signature de partenariats stratégiques majeurs.",
            "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
            "/evenements",
            "Événement Majeur",
            1,
            1
        ]);
        $stmtSeed->execute([
            "Mission Économique & Immersion BNE à Abidjan",
            "Accélération des opportunités d'investissement, rencontres B2B qualifiées par IA et visites de sites industriels phares.",
            "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
            "/sejours-bne",
            "Séjour Immersif",
            2,
            1
        ]);
        $stmtSeed->execute([
            "Intelligence Artificielle & Alliances Transfrontalières",
            "Déploiement de notre infrastructure d'intelligence décisionnelle pour connecter les décideurs d'Europe et d'Afrique.",
            "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
            "/services-ia",
            "Stratégie & IA",
            3,
            1
        ]);
    }
} catch (PDOException $e) {}

// Table des Articles de Blog
$pdo->exec("CREATE TABLE IF NOT EXISTS blog_articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'BNE BUSINESS',
    color VARCHAR(50) DEFAULT 'gold',
    date VARCHAR(50) NOT NULL,
    `desc` TEXT NOT NULL,
    img VARCHAR(500) NOT NULL,
    tags JSON DEFAULT NULL,
    sections JSON DEFAULT NULL,
    is_featured TINYINT(1) DEFAULT 0,
    show_in_slider TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

try {
    $blog_count = $pdo->query("SELECT COUNT(*) FROM blog_articles")->fetchColumn();
    if ($blog_count == 0) {
        $stmtBlogSeed = $pdo->prepare("INSERT INTO blog_articles (title, category, color, date, `desc`, img, tags, sections, is_featured, show_in_slider) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmtBlogSeed->execute([
            "Le Maroc, 4ème producteur automobile d'Afrique : la montée en puissance",
            "BNE BUSINESS",
            "gold",
            "16/06/2026",
            "Morocco consolidates its position as the 4th largest African car producer with 46,000 vehicles/year and investments of USD 400M.",
            "https://www.infomediaire.net/wp-content/uploads/2023/06/automobile.jpg",
            json_encode(["#industrie", "#automobile", "#Maroc"]),
            json_encode([
                [
                    "image" => "https://www.infomediaire.net/wp-content/uploads/2023/06/automobile.jpg",
                    "subtitle" => "Un hub industriel stratégique aux portes de l'Europe et de l'Afrique",
                    "text" => "Le Maroc confirme sa trajectoire d'excellence industrielle en consolidant son statut de plaque tournante automobile internationale. Grâce à des infrastructures modernes telles que Tanger Med et des zones franches dynamiques, le royaume attire les plus grands constructeurs et équipementiers mondiaux."
                ],
                [
                    "image" => "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80",
                    "subtitle" => "Transition vers l'électrique et montée en gamme technologique",
                    "text" => "Avec des investissements dépassant 400 millions de dollars, les usines intègrent désormais des lignes robotisées avancées et anticipent la transition énergétique. L'écosystème local compte plus de 250 équipementiers de rang 1 et 2, permettant d'atteindre un taux d'intégration locale record."
                ],
                [
                    "image" => "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
                    "subtitle" => "Synergies d'affaires et opportunités pour les membres BNE",
                    "text" => "Pour les dirigeants et investisseurs du réseau BNE, ce secteur offre d'immenses opportunités de co-investissement, de logistique transfrontalière et de partenariats technologiques de premier plan."
                ]
            ]),
            1,
            1
        ]);
        $stmtBlogSeed->execute([
            "Cybersécurité en Afrique : les entreprises face aux nouvelles menaces",
            "BNE EXPERTISE",
            "emerald-500",
            "15/06/2026",
            "Les cyberattaques en Afrique augmentent de 35% par an. Comment les entreprises se protègent en 2026.",
            "https://mtsgroup.ma/wp-content/uploads/2024/10/MTS-GROUP-AFRICA-CSE-cybersecurity-in-Africa.-The-scene-should-show-a-digital-map-of-Africa-glowing-in-blue-with-circui.webp",
            json_encode(["#cybersécurité", "#Afrique", "#protection"]),
            json_encode([
                [
                    "image" => "https://mtsgroup.ma/wp-content/uploads/2024/10/MTS-GROUP-AFRICA-CSE-cybersecurity-in-Africa.-The-scene-should-show-a-digital-map-of-Africa-glowing-in-blue-with-circui.webp",
                    "subtitle" => "Une menace exponentielle sur les systèmes bancaires et télécoms",
                    "text" => "Face à l'explosion des transactions mobiles et à la numérisation accélérée des institutions financières en Afrique, la sécurisation des flux de données est devenue une priorité absolue de souveraineté."
                ],
                [
                    "image" => "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",
                    "subtitle" => "Gouvernance des risques et architectures hermétiques",
                    "text" => "Les entreprises leaders adoptent des protocoles Zero Trust, forment continuellement leurs équipes contre le phishing ciblé et auditent régulièrement leurs infrastructures critiques."
                ]
            ]),
            0,
            0
        ]);
    }
} catch (PDOException $e) {}

// --- Gestion des Vidéos ---
if ($action === 'add_video' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = $data->title ?? 'Sans titre';
    $url = $data->url ?? '';
    $category = $data->category ?? 'general';
    preg_match('%(?:youtube(?:-nocookie)?\.com/(?:[^/]+/.+/|(?:v|e(?:mbed)?)/|.*[?&]v=)|youtu\.be/)([^"&?/ ]{11})%i', $url, $match);
    $youtube_id = $match[1] ?? '';

    if ($youtube_id) {
        $stmt = $pdo->prepare("INSERT INTO videos (title, youtube_id, category) VALUES (?, ?, ?)");
        if ($stmt->execute([$title, $youtube_id, $category])) echo json_encode(['success' => true]);
        else { http_response_code(500); echo json_encode(['success' => false, 'error' => 'Erreur BDD']); }
    } else {
        http_response_code(400); echo json_encode(['success' => false, 'error' => 'Lien YouTube invalide']);
    }
    exit();
}

if ($action === 'delete_video' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $stmt = $pdo->prepare("DELETE FROM videos WHERE id = ?");
    $stmt->execute([$data->id ?? 0]);
    echo json_encode(['success' => true]); exit();
}

// --- Gestion des Événements ---
if ($action === 'add_event' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = $data->title ?? ''; $date = $data->date ?? ''; $location = $data->location ?? '';
    $description = $data->description ?? ''; $type = $data->type ?? 'Événement'; $image_url = $data->image_url ?? '';
    $price = $data->price ?? ''; $title_en = $data->title_en ?? ''; $description_en = $data->description_en ?? '';
    $billetterie_url = $data->billetterie_url ?? ''; $event_code = $data->event_code ?? '';
    $program = isset($data->program) ? json_encode($data->program) : null;
    
    $stmt = $pdo->prepare("INSERT INTO events (title, title_en, date, location, description, description_en, type, image_url, price, billetterie_url, program, event_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    if ($stmt->execute([$title, $title_en, $date, $location, $description, $description_en, $type, $image_url, $price, $billetterie_url, $program, $event_code])) echo json_encode(['success' => true]);
    else { http_response_code(500); echo json_encode(['success' => false, 'error' => 'Erreur BDD']); }
    exit();
}

if ($action === 'edit_event' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $data->id ?? 0; $title = $data->title ?? ''; $date = $data->date ?? ''; $location = $data->location ?? '';
    $description = $data->description ?? ''; $type = $data->type ?? 'Événement'; $image_url = $data->image_url ?? '';
    $price = $data->price ?? ''; $title_en = $data->title_en ?? ''; $description_en = $data->description_en ?? '';
    $billetterie_url = $data->billetterie_url ?? ''; $event_code = $data->event_code ?? '';
    $program = isset($data->program) ? json_encode($data->program) : null;
    
    $stmt = $pdo->prepare("UPDATE events SET title=?, title_en=?, date=?, location=?, description=?, description_en=?, type=?, image_url=?, price=?, billetterie_url=?, program=?, event_code=? WHERE id=?");
    if ($stmt->execute([$title, $title_en, $date, $location, $description, $description_en, $type, $image_url, $price, $billetterie_url, $program, $event_code, $id])) echo json_encode(['success' => true]);
    else { http_response_code(500); echo json_encode(['success' => false, 'error' => 'Erreur BDD']); }
    exit();
}

if ($action === 'delete_event' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $stmt = $pdo->prepare("DELETE FROM events WHERE id = ?");
    $stmt->execute([$data->id ?? 0]);
    echo json_encode(['success' => true]); exit();
}

if ($action === 'save_replay_data' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $data->id ?? 0;
    $replay_data = isset($data->replay_data) ? json_encode($data->replay_data) : null;
    $stmt = $pdo->prepare("UPDATE events SET replay_data=? WHERE id=?");
    if ($stmt->execute([$replay_data, $id])) echo json_encode(['success' => true]);
    else { http_response_code(500); echo json_encode(['success' => false, 'error' => 'Erreur BDD']); }
    exit();
}

if ($action === 'scan_directory' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $folder_path = $data->path ?? '';
    // Sécurisation basique du chemin et normalisation (Windows)
    $folder_path = str_replace('\\', '/', $folder_path);
    $folder_path = str_replace('..', '', $folder_path);
    $folder_path = trim($folder_path, '/');
    
    // Le dossier de base est le dossier où se trouve api-admin.php (public/)
    $base_dir = __DIR__;
    $target_dir = $base_dir . '/' . $folder_path;
    
    if (empty($folder_path) || !is_dir($target_dir)) {
        http_response_code(400); 
        echo json_encode([
            'success' => false, 
            'error' => 'Dossier introuvable. Indiquez un dossier situé dans public (ex: assets/events/namaste) ou utilisez l\'import direct de photos.'
        ]);
        exit();
    }
    
    $allowed_extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    $images = [];
    
    $files = scandir($target_dir);
    foreach ($files as $file) {
        $file_path = $target_dir . '/' . $file;
        if (is_file($file_path)) {
            $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
            if (in_array($ext, $allowed_extensions)) {
                // Créer l'URL publique
                $images[] = '/' . $folder_path . '/' . $file;
            }
        }
    }
    
    echo json_encode(['success' => true, 'images' => $images]);
    exit();
}

// --- Upload d'Images ---
if ($action === 'upload_image' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        $upload_errors = [
            UPLOAD_ERR_INI_SIZE   => 'Fichier trop volumineux (limite PHP ini)',
            UPLOAD_ERR_FORM_SIZE  => 'Fichier trop volumineux (limite formulaire)',
            UPLOAD_ERR_PARTIAL    => 'Transfert partiel, veuillez réessayer',
            UPLOAD_ERR_NO_FILE    => 'Aucun fichier envoyé',
            UPLOAD_ERR_NO_TMP_DIR => 'Dossier temporaire introuvable sur le serveur',
            UPLOAD_ERR_CANT_WRITE => 'Impossible d\'écrire sur le disque serveur',
            UPLOAD_ERR_EXTENSION  => 'Extension PHP a bloqué l\'upload',
        ];
        $err_code = $_FILES['file']['error'] ?? -1;
        $err_msg  = $upload_errors[$err_code] ?? "Erreur inconnue (code $err_code)";
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => $err_msg]);
        exit();
    }

    $file = $_FILES['file'];
    $allowed_extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

    if (!in_array($ext, $allowed_extensions)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Format non autorisé. Utilisez JPG, PNG, WEBP ou GIF.']);
        exit();
    }

    // Dossier d'upload : toujours relatif à ce fichier PHP (public/assets/uploads/)
    $upload_dir = __DIR__ . '/assets/uploads/';
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0755, true);
    }

    // Vérifier que le dossier est accessible en écriture
    if (!is_writable($upload_dir)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Dossier upload non accessible en écriture sur le serveur. Vérifiez les permissions (chmod 755 ou 777).']);
        exit();
    }

    $filename = uniqid('img_') . '.' . $ext;
    $target_path = $upload_dir . $filename;

    if (move_uploaded_file($file['tmp_name'], $target_path)) {
        // URL avec slash initial = chemin absolu depuis la racine web = fonctionne en local ET en production
        echo json_encode(['success' => true, 'url' => '/assets/uploads/' . $filename]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Erreur lors de la sauvegarde sur le serveur (move_uploaded_file a échoué)']);
    }
    exit();
}

// --- Gestion des Membres ---
if ($action === 'add_member' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = $data->name ?? ''; $role = $data->role ?? ''; $image_url = $data->image_url ?? '';
    $flag = $data->flag ?? ''; $countryCode = $data->countryCode ?? '';
    $stmt = $pdo->prepare("INSERT INTO members (name, role, image_url, flag, countryCode) VALUES (?, ?, ?, ?, ?)");
    if ($stmt->execute([$name, $role, $image_url, $flag, $countryCode])) echo json_encode(['success' => true]);
    else { http_response_code(500); echo json_encode(['success' => false, 'error' => 'Erreur BDD']); }
    exit();
}

if ($action === 'edit_member' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $data->id ?? 0; $name = $data->name ?? ''; $role = $data->role ?? ''; $image_url = $data->image_url ?? '';
    $flag = $data->flag ?? ''; $countryCode = $data->countryCode ?? '';
    $stmt = $pdo->prepare("UPDATE members SET name=?, role=?, image_url=?, flag=?, countryCode=? WHERE id=?");
    if ($stmt->execute([$name, $role, $image_url, $flag, $countryCode, $id])) echo json_encode(['success' => true]);
    else { http_response_code(500); echo json_encode(['success' => false, 'error' => 'Erreur BDD']); }
    exit();
}

if ($action === 'delete_member' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $stmt = $pdo->prepare("DELETE FROM members WHERE id = ?");
    $stmt->execute([$data->id ?? 0]); echo json_encode(['success' => true]); exit();
}

// --- Gestion des Partenaires (enrichis) ---
if ($action === 'add_partner' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = $data->name ?? ''; $category = $data->category ?? ''; $country = $data->country ?? '';
    $logo_url = $data->logo_url ?? ''; $flag = $data->flag ?? ''; $sector = $data->sector ?? ''; $website = $data->website ?? '';
    $stmt = $pdo->prepare("INSERT INTO partners (name, category, country, logo_url, flag, sector, website) VALUES (?, ?, ?, ?, ?, ?, ?)");
    if ($stmt->execute([$name, $category, $country, $logo_url, $flag, $sector, $website])) echo json_encode(['success' => true]);
    else { http_response_code(500); echo json_encode(['success' => false, 'error' => 'Erreur BDD']); }
    exit();
}

if ($action === 'edit_partner' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $data->id ?? 0; $name = $data->name ?? ''; $category = $data->category ?? ''; $country = $data->country ?? '';
    $logo_url = $data->logo_url ?? ''; $flag = $data->flag ?? ''; $sector = $data->sector ?? ''; $website = $data->website ?? '';
    $stmt = $pdo->prepare("UPDATE partners SET name=?, category=?, country=?, logo_url=?, flag=?, sector=?, website=? WHERE id=?");
    if ($stmt->execute([$name, $category, $country, $logo_url, $flag, $sector, $website, $id])) echo json_encode(['success' => true]);
    else { http_response_code(500); echo json_encode(['success' => false, 'error' => 'Erreur BDD']); }
    exit();
}

if ($action === 'delete_partner' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $stmt = $pdo->prepare("DELETE FROM partners WHERE id = ?");
    $stmt->execute([$data->id ?? 0]); echo json_encode(['success' => true]); exit();
}

// --- Gestion des Ambassadeurs ---
if ($action === 'add_ambassador' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $country = $data->country ?? ''; $flag = $data->flag ?? ''; $zone = $data->zone ?? '';
    $expertises = $data->expertises ?? ''; $logo_url = $data->logo_url ?? ''; $company = $data->company ?? '';
    $stmt = $pdo->prepare("INSERT INTO ambassadors (country, flag, zone, expertises, logo_url, company) VALUES (?, ?, ?, ?, ?, ?)");
    if ($stmt->execute([$country, $flag, $zone, $expertises, $logo_url, $company])) echo json_encode(['success' => true]);
    else { http_response_code(500); echo json_encode(['success' => false, 'error' => 'Erreur BDD']); }
    exit();
}

if ($action === 'edit_ambassador' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $data->id ?? 0; $country = $data->country ?? ''; $flag = $data->flag ?? ''; $zone = $data->zone ?? '';
    $expertises = $data->expertises ?? ''; $logo_url = $data->logo_url ?? ''; $company = $data->company ?? '';
    $stmt = $pdo->prepare("UPDATE ambassadors SET country=?, flag=?, zone=?, expertises=?, logo_url=?, company=? WHERE id=?");
    if ($stmt->execute([$country, $flag, $zone, $expertises, $logo_url, $company, $id])) echo json_encode(['success' => true]);
    else { http_response_code(500); echo json_encode(['success' => false, 'error' => 'Erreur BDD']); }
    exit();
}

if ($action === 'get_ambassadors' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query("SELECT * FROM ambassadors ORDER BY country ASC");
    echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]); exit();
}

if ($action === 'get_partners' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query("SELECT * FROM partners ORDER BY name ASC");
    echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]); exit();
}

if ($action === 'delete_ambassador' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $stmt = $pdo->prepare("DELETE FROM ambassadors WHERE id = ?");
    $stmt->execute([$data->id ?? 0]); echo json_encode(['success' => true]); exit();
}

// --- Gestion des Avis (Reviews) ---
if ($action === 'add_review' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = $data->name ?? ''; $role = $data->role ?? ''; $quote = $data->quote ?? ''; $country = $data->country ?? '';
    $stmt = $pdo->prepare("INSERT INTO avis (nom, role, commentaire, pays, evenement, code_evenement, note) VALUES (?, ?, ?, ?, 'Admin', 'ADMIN', 5)");
    if ($stmt->execute([$name, $role, $quote, $country])) echo json_encode(['success' => true]);
    else { http_response_code(500); echo json_encode(['success' => false, 'error' => 'Erreur BDD']); }
    exit();
}

if ($action === 'edit_review' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $data->id ?? 0; $name = $data->name ?? ''; $role = $data->role ?? ''; $quote = $data->quote ?? ''; $country = $data->country ?? '';
    $stmt = $pdo->prepare("UPDATE avis SET nom=?, role=?, commentaire=?, pays=? WHERE id=?");
    if ($stmt->execute([$name, $role, $quote, $country, $id])) echo json_encode(['success' => true]);
    else { http_response_code(500); echo json_encode(['success' => false, 'error' => 'Erreur BDD']); }
    exit();
}

if ($action === 'delete_review' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $stmt = $pdo->prepare("DELETE FROM avis WHERE id = ?");
    $stmt->execute([$data->id ?? 0]); echo json_encode(['success' => true]); exit();
}

// --- Gestion des Candidatures (Applications) ---
if ($action === 'get_applications' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query("SELECT * FROM applications ORDER BY created_at DESC");
    echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]); exit();
}

if ($action === 'update_application_status' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $data->id ?? 0;
    $status = $data->status ?? 'pending';
    $stmt = $pdo->prepare("UPDATE applications SET status = ? WHERE id = ?");
    if ($stmt->execute([$status, $id])) echo json_encode(['success' => true]);
    else { http_response_code(500); echo json_encode(['success' => false, 'error' => 'Erreur BDD']); }
    exit();
}

if ($action === 'delete_application' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $stmt = $pdo->prepare("DELETE FROM applications WHERE id = ?");
    $stmt->execute([$data->id ?? 0]); echo json_encode(['success' => true]); exit();
}

// --- Statistiques ---
if ($action === 'stats' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $stats = [];
    $stmt = $pdo->query("SELECT country, COUNT(*) as count FROM visites GROUP BY country ORDER BY count DESC LIMIT 10");
    $stats['countries'] = $stmt->fetchAll();
    
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM visites"); $stats['total_visits'] = $stmt->fetch()['total'];
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM videos"); $stats['total_videos'] = $stmt->fetch()['total'];
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM events WHERE date >= NOW()"); $stats['upcoming_events'] = $stmt->fetch()['total'];
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM members"); $stats['total_members'] = $stmt->fetch()['total'];
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM partners"); $stats['total_partners'] = $stmt->fetch()['total'];

    echo json_encode(['success' => true, 'data' => $stats]); exit();
}

// --- Gestion des Statistiques Globales (Site Stats) ---
if ($action === 'get_site_stats' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query("SELECT * FROM site_stats WHERE id = 1");
    $stats = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$stats) $stats = [];

    // Auto-calcul
    $stats['auto_ambassadors'] = (int)$pdo->query("SELECT COUNT(*) FROM ambassadors")->fetchColumn();
    $stats['auto_partners'] = (int)$pdo->query("SELECT COUNT(*) FROM partners")->fetchColumn();
    $stats['auto_events'] = (int)$pdo->query("SELECT COUNT(*) FROM events WHERE type != 'sejour' OR type IS NULL")->fetchColumn();
    $stats['auto_trips'] = (int)$pdo->query("SELECT COUNT(*) FROM events WHERE type = 'sejour'")->fetchColumn();
    
    // Essayer de récupérer le nombre total de participants (nécessite une colonne participants_count)
    try {
        $stats['auto_participants'] = (int)$pdo->query("SELECT SUM(participants_count) FROM events")->fetchColumn();
    } catch (PDOException $e) {
        $stats['auto_participants'] = 0;
        // Créer la colonne si elle manque
        try { $pdo->exec("ALTER TABLE events ADD COLUMN participants_count INT DEFAULT 0"); } catch(PDOException $ex) {}
    }

    echo json_encode(['success' => true, 'data' => $stats]); exit();
}

if ($action === 'update_site_stats' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $stmt = $pdo->prepare("UPDATE site_stats SET ambassadors_count = ?, partners_count = ?, events_count = ?, trips_count = ?, participants_count = ?, members_count = ?, countries_count = ?, satisfaction_rate = ? WHERE id = 1");
    if ($stmt->execute([
        $data->ambassadors_count ?? 0,
        $data->partners_count ?? 0,
        $data->events_count ?? 0,
        $data->trips_count ?? 0,
        $data->participants_count ?? 0,
        $data->members_count ?? 10,
        $data->countries_count ?? 4,
        $data->satisfaction_rate ?? '87%'
    ])) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500); echo json_encode(['success' => false, 'error' => 'Erreur BDD']);
    }
    exit();
}

// --- Gestion des Actualités Hero (Slider) ---
if ($action === 'get_hero_news' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query("SELECT * FROM hero_news ORDER BY order_num ASC, created_at DESC");
    echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    exit();
}

if ($action === 'save_hero_news' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = isset($data->id) && !empty($data->id) ? (int)$data->id : null;
    $title = trim($data->title ?? '');
    $rawComment = $data->comment ?? '';
    // Nettoyage strict des balises HTML pour le commentaire affiché dans le slider
    $cleanComment = trim(strip_tags(html_entity_decode($rawComment, ENT_QUOTES | ENT_HTML5, 'UTF-8')));
    $comment = preg_replace('/\s+/', ' ', $cleanComment);
    $image_url = $data->image_url ?? '';
    $link_url = $data->link_url ?? '';
    $tag = $data->tag ?? 'Actualité Principale';
    $order_num = isset($data->order_num) ? (int)$data->order_num : 0;
    $is_active = isset($data->is_active) ? (int)$data->is_active : 1;

    if (empty($title) || empty($comment) || empty($image_url)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Titre, commentaire et image requis']);
        exit();
    }

    if ($id) {
        $stmt = $pdo->prepare("UPDATE hero_news SET title = ?, comment = ?, image_url = ?, link_url = ?, tag = ?, order_num = ?, is_active = ? WHERE id = ?");
        $stmt->execute([$title, $comment, $image_url, $link_url, $tag, $order_num, $is_active, $id]);
    } else {
        // Recherche si un slide existe déjà avec le même titre ou le même link_url
        $chk = null;
        if (!empty($link_url) && $link_url !== '/evenements') {
            $stmtChk = $pdo->prepare("SELECT id FROM hero_news WHERE link_url = ?");
            $stmtChk->execute([$link_url]);
            $chk = $stmtChk->fetch(PDO::FETCH_ASSOC);
        }
        if (!$chk) {
            $stmtChk = $pdo->prepare("SELECT id FROM hero_news WHERE title = ?");
            $stmtChk->execute([$title]);
            $chk = $stmtChk->fetch(PDO::FETCH_ASSOC);
        }

        if ($chk && !empty($chk['id'])) {
            $id = $chk['id'];
            $stmt = $pdo->prepare("UPDATE hero_news SET title = ?, comment = ?, image_url = ?, link_url = ?, tag = ?, order_num = ?, is_active = ? WHERE id = ?");
            $stmt->execute([$title, $comment, $image_url, $link_url, $tag, $order_num, $is_active, $id]);
            // Supprimer d'éventuels autres doublons résiduels
            $delDups = $pdo->prepare("DELETE FROM hero_news WHERE title = ? AND id != ?");
            $delDups->execute([$title, $id]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO hero_news (title, comment, image_url, link_url, tag, order_num, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$title, $comment, $image_url, $link_url, $tag, $order_num, $is_active]);
        }
    }
    echo json_encode(['success' => true]);
    exit();
}

if ($action === 'remove_event_hero_news' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = trim($data->title ?? '');
    $link_url = trim($data->link_url ?? '');
    if (!empty($link_url) && $link_url !== '/evenements') {
        $del = $pdo->prepare("DELETE FROM hero_news WHERE link_url = ?");
        $del->execute([$link_url]);
    }
    if (!empty($title)) {
        $del = $pdo->prepare("DELETE FROM hero_news WHERE title = ?");
        $del->execute([$title]);
    }
    echo json_encode(['success' => true]);
    exit();
}

if ($action === 'delete_hero_news' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = isset($data->id) ? (int)$data->id : 0;
    $stmt = $pdo->prepare("DELETE FROM hero_news WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(['success' => true]);
    exit();
}

// --- Gestion des Articles de Blog ---
if ($action === 'get_blog_articles' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query("SELECT * FROM blog_articles ORDER BY is_featured DESC, created_at DESC");
    $articles = $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];
    foreach ($articles as &$art) {
        if (isset($art['tags']) && is_string($art['tags'])) $art['tags'] = json_decode($art['tags'], true) ?: [];
        if (isset($art['sections']) && is_string($art['sections'])) $art['sections'] = json_decode($art['sections'], true) ?: [];
    }
    echo json_encode(['success' => true, 'data' => $articles]);
    exit();
}

if ($action === 'save_blog_article' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = isset($data->id) && !empty($data->id) ? (int)$data->id : null;
    $title = $data->title ?? '';
    $category = $data->category ?? 'BNE BUSINESS';
    $color = $data->color ?? 'gold';
    $date = $data->date ?? date('d/m/Y');
    $desc = $data->desc ?? '';
    $img = $data->img ?? '';
    $tags = json_encode($data->tags ?? []);
    $sections = json_encode($data->sections ?? []);
    $is_featured = isset($data->is_featured) && $data->is_featured ? 1 : 0;
    $show_in_slider = isset($data->show_in_slider) && $data->show_in_slider ? 1 : 0;

    if (empty($title) || empty($desc) || empty($img)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Titre, description et image requis']);
        exit();
    }

    if ($is_featured) {
        try { $pdo->exec("UPDATE blog_articles SET is_featured = 0"); } catch (PDOException $e) {}
    }

    if ($id) {
        $stmt = $pdo->prepare("UPDATE blog_articles SET title = ?, category = ?, color = ?, date = ?, `desc` = ?, img = ?, tags = ?, sections = ?, is_featured = ?, show_in_slider = ? WHERE id = ?");
        $stmt->execute([$title, $category, $color, $date, $desc, $img, $tags, $sections, $is_featured, $show_in_slider, $id]);
        $articleId = $id;
    } else {
        $stmt = $pdo->prepare("INSERT INTO blog_articles (title, category, color, date, `desc`, img, tags, sections, is_featured, show_in_slider) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$title, $category, $color, $date, $desc, $img, $tags, $sections, $is_featured, $show_in_slider]);
        $articleId = $pdo->lastInsertId();
    }

    // Synchronisation avec le slider Hero de l'accueil
    $blogLink = "/blog/" . $articleId;
    if ($show_in_slider) {
        $chk = $pdo->prepare("SELECT id FROM hero_news WHERE link_url = ?");
        $chk->execute([$blogLink]);
        $existingHero = $chk->fetch();
        if ($existingHero) {
            $upd = $pdo->prepare("UPDATE hero_news SET title = ?, comment = ?, image_url = ?, tag = ?, is_active = 1 WHERE id = ?");
            $upd->execute([$title, $desc, $img, $category, $existingHero['id']]);
        } else {
            $ins = $pdo->prepare("INSERT INTO hero_news (title, comment, image_url, link_url, tag, order_num, is_active) VALUES (?, ?, ?, ?, ?, 1, 1)");
            $ins->execute([$title, $desc, $img, $blogLink, $category]);
        }
    } else {
        $del = $pdo->prepare("DELETE FROM hero_news WHERE link_url = ?");
        $del->execute([$blogLink]);
    }

    echo json_encode(['success' => true, 'id' => $articleId]);
    exit();
}

if ($action === 'delete_blog_article' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = isset($data->id) ? (int)$data->id : 0;
    $stmt = $pdo->prepare("DELETE FROM blog_articles WHERE id = ?");
    $stmt->execute([$id]);

    $del = $pdo->prepare("DELETE FROM hero_news WHERE link_url = ?");
    $del->execute(["/blog/" . $id]);

    echo json_encode(['success' => true]);
    exit();
}

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Action inconnue']);

