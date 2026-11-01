<?php
/**
 * API pour gérer les avis (Reviews)
 * Hébergement : OVH
 */

// Autoriser les requêtes (CORS) - Utile pour le développement local
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Si c'est une requête OPTIONS (Preflight CORS), on s'arrête là.
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ==========================================
// CONFIGURATION DE LA BASE DE DONNÉES OVH
// ==========================================
$host = "zwpvaah279.mysql.db";
$dbname = "zwpvaah279";
$username = "zwpvaah279";
$password = "France2026";

try {
    // Connexion à la base de données
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    // Configurer PDO pour qu'il lance des exceptions en cas d'erreur
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Création automatique de la table si elle n'existe pas
    $sql = "CREATE TABLE IF NOT EXISTS avis (
        id INT AUTO_INCREMENT PRIMARY KEY,
        pays VARCHAR(50) NOT NULL,
        evenement VARCHAR(100) NOT NULL,
        code_evenement VARCHAR(50) NOT NULL,
        nom VARCHAR(100) NOT NULL,
        role VARCHAR(100) NOT NULL,
        note INT NOT NULL,
        commentaire TEXT NOT NULL,
        date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $pdo->exec($sql);
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Erreur de connexion à la base de données", "details" => $e->getMessage()]);
    exit();
}

// ==========================================
// GESTION DES REQUÊTES (GET / POST)
// ==========================================

// 1. LIRE LES AVIS (Requête GET)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // On récupère les avis du plus récent au plus ancien
        $stmt = $pdo->query("SELECT * FROM avis ORDER BY date_creation DESC");
        $avis = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(["success" => true, "data" => $avis]);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Erreur lors de la récupération des avis"]);
    }
}

// 2. AJOUTER UN AVIS (Requête POST)
elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Récupérer les données JSON envoyées par React
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    // Vérifier que toutes les données requises sont présentes
    if (
        !empty($data['pays']) && 
        !empty($data['evenement']) && 
        !empty($data['code_evenement']) && 
        !empty($data['nom']) && 
        !empty($data['role']) && 
        isset($data['note']) && 
        !empty($data['commentaire'])
    ) {
        try {
            // Préparer la requête d'insertion (sécurisé contre les injections SQL)
            $stmt = $pdo->prepare("
                INSERT INTO avis (pays, evenement, code_evenement, nom, role, note, commentaire) 
                VALUES (:pays, :evenement, :code_evenement, :nom, :role, :note, :commentaire)
            ");
            
            // Exécuter la requête
            $stmt->execute([
                ':pays' => htmlspecialchars($data['pays']),
                ':evenement' => htmlspecialchars($data['evenement']),
                ':code_evenement' => htmlspecialchars($data['code_evenement']),
                ':nom' => htmlspecialchars($data['nom']),
                ':role' => htmlspecialchars($data['role']),
                ':note' => (int)$data['note'],
                ':commentaire' => htmlspecialchars($data['commentaire'])
            ]);
            
            echo json_encode(["success" => true, "message" => "Avis publié avec succès."]);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Erreur lors de l'enregistrement de l'avis"]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Données incomplètes. Veuillez remplir tous les champs."]);
    }
}

// Requête non reconnue
else {
    http_response_code(405);
    echo json_encode(["error" => "Méthode non autorisée"]);
}
?>
