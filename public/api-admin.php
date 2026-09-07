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

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Action inconnue']);
