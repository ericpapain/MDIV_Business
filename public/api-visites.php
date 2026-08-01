<?php
// api-visites.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Gérer les requêtes preflight CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host = 'zwpvaah279.mysql.db';
$db   = 'zwpvaah279';
$user = 'zwpvaah279';
$pass = 'Champion2018';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Erreur de connexion BDD']);
    exit;
}

// 1. Créer la table si elle n'existe pas
$sqlCreate = "
CREATE TABLE IF NOT EXISTS visites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    country VARCHAR(100) DEFAULT 'Unknown',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
";

try {
    $pdo->exec($sqlCreate);
} catch (\PDOException $e) {
    // Ignorer si la création échoue (droits)
}

// Obtenir l'IP du visiteur
$ip = $_SERVER['REMOTE_ADDR'];
if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
    $ip = $_SERVER['HTTP_CLIENT_IP'];
} elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
    $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
}

// On vérifie si cette IP a déjà été enregistrée dans la dernière heure pour éviter le spam
$stmtCheck = $pdo->prepare("SELECT id FROM visites WHERE ip_address = ? AND created_at > (NOW() - INTERVAL 1 HOUR)");
$stmtCheck->execute([$ip]);
$recentVisit = $stmtCheck->fetch();

if (!$recentVisit) {
    // Obtenir le pays via ip-api
    $country = 'Unknown';
    if (filter_var($ip, FILTER_VALIDATE_IP) && $ip !== '127.0.0.1' && $ip !== '::1') {
        $ctx = stream_context_create(['http' => ['timeout' => 2]]);
        $ipData = @file_get_contents("http://ip-api.com/json/{$ip}?fields=country", false, $ctx);
        if ($ipData) {
            $json = json_decode($ipData, true);
            if (!empty($json['country'])) {
                $country = $json['country'];
            }
        }
    }

    // Insérer la visite
    $stmtInsert = $pdo->prepare("INSERT INTO visites (ip_address, country) VALUES (?, ?)");
    $stmtInsert->execute([$ip, $country]);
}

// Compter le nombre total de visites
$stmtCount = $pdo->query("SELECT COUNT(*) as total FROM visites");
$row = $stmtCount->fetch();
$totalVisits = $row['total'];

// Renvoyer le total (plus 234 par défaut pour garder l'historique visuellement)
$baseCount = 234;
$displayCount = $baseCount + $totalVisits;

echo json_encode([
    'success' => true,
    'total' => $displayCount
]);
