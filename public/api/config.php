<?php
/**
 * Configuration principale de l'API (Backend PHP)
 * 
 * RÔLE ARCHITECTURAL :
 * - Gérer la sécurité (CORS) pour que seul le frontend puisse appeler l'API.
 * - Gérer la connexion à la base de données MySQL.
 * - Fournir une fonction utilitaire pour appeler l'IA (Groq par défaut).
 */

// 1. GESTION DE LA SÉCURITÉ (CORS)
// Permet au frontend React (même s'il tourne sur localhost:5173 en dev) de communiquer avec PHP.
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Si c'est une requête de pré-vérification (OPTIONS), on arrête ici.
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// 2. CONFIGURATION DE L'IA (GROQ / OPENAI)
// Pour switcher vers la version payante (OpenAI), il suffira de changer la constante API_URL 
// par "https://api.openai.com/v1/chat/completions" et de mettre une clé OpenAI.
// Le format de la requête et de la réponse est exactement le même !

define('GROQ_API_KEY', getenv('GROQ_API_KEY') ?: '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'); 
// NOTE: En production, utilisez des variables d'environnement (.env) via le serveur OVH.
define('LLM_API_URL', 'https://api.groq.com/openai/v1/chat/completions');
// define('LLM_API_URL', 'https://api.openai.com/v1/chat/completions'); // SOLUTION PAYANTE (Décommenter pour basculer)

define('LLM_MODEL', 'llama-3.1-8b-instant');
// define('LLM_MODEL', 'gpt-4o-mini'); // SOLUTION PAYANTE (Décommenter pour basculer)

/**
 * Fonction utilitaire pour interroger l'IA (Groq ou OpenAI)
 * 
 * @param array $messages Le tableau des messages (System, User, Assistant)
 * @param bool $jsonMode Faut-il forcer l'IA à répondre en JSON strict ?
 * @return array La réponse décodée de l'IA
 */
function call_llm_api($messages, $jsonMode = false) {
    $data = [
        "model" => LLM_MODEL,
        "messages" => $messages,
        "temperature" => 0.7
    ];

    if ($jsonMode) {
        $data["response_format"] = ["type" => "json_object"];
    }

    $ch = curl_init(LLM_API_URL);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . GROQ_API_KEY
    ]);

    // Évite les timeouts PHP trop rapides sur l'hébergement mutualisé
    curl_setopt($ch, CURLOPT_TIMEOUT, 60);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    if ($httpCode !== 200) {
        throw new Exception("Erreur API IA ($httpCode) : " . ($response ?: $error));
    }

    return json_decode($response, true);
}

// 3. CONFIGURATION DE LA BASE DE DONNÉES MYSQL (OVH)
define('DB_HOST', getenv('DB_HOST') ?: 'localhost'); // Remplacer par le serveur OVH en prod
define('DB_NAME', getenv('DB_NAME') ?: 'mdiv_db');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');

/**
 * Fonction pour obtenir la connexion PDO à la base de données
 */
function get_db_connection() {
    try {
        $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        // Auto-création des tables si elles n'existent pas
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `companies` (
              `id` INT AUTO_INCREMENT PRIMARY KEY,
              `company_name` VARCHAR(255) NOT NULL,
              `email` VARCHAR(255) NOT NULL UNIQUE,
              `password_hash` VARCHAR(255) NOT NULL,
              `status` ENUM('active', 'inactive', 'banned') DEFAULT 'active',
              `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");
        
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `diagnostics` (
              `id` INT AUTO_INCREMENT PRIMARY KEY,
              `company_id` INT NOT NULL,
              `diagnostic_type` VARCHAR(100) NOT NULL DEFAULT 'express',
              `questions_answers` JSON NOT NULL COMMENT 'Historique de la conversation',
              `score` INT NOT NULL,
              `report` JSON NOT NULL COMMENT 'Synthèse, insights et recommandations',
              `status` ENUM('completed', 'failed', 'pending') DEFAULT 'completed',
              `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              CONSTRAINT `fk_company_diagnostic` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        return $pdo;
    } catch (PDOException $e) {
        // En prod, ne pas afficher le vrai message d'erreur pour des raisons de sécurité
        throw new Exception("Erreur de connexion à la base de données: " . $e->getMessage());
    }
}

// 4. SÉCURITÉ & AUTHENTIFICATION (JWT)
// Clé secrète pour signer les tokens (À METTRE DANS LES VARIABLES D'ENVIRONNEMENT EN PROD !)
define('JWT_SECRET', getenv('JWT_SECRET') ?: 'SuperSecretKey_MDIV_Business_2026!');

/**
 * Encode un tableau en base64url
 */
function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

/**
 * Décode une chaîne base64url
 */
function base64url_decode($data) {
    return base64_decode(str_pad(strtr($data, '-_', '+/'), strlen($data) % 4, '=', STR_PAD_RIGHT));
}

/**
 * Génère un JSON Web Token (JWT) valide
 */
function generate_jwt($payload) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload['exp'] = time() + (86400 * 7); // Expire dans 7 jours
    
    $base64UrlHeader = base64url_encode($header);
    $base64UrlPayload = base64url_encode(json_encode($payload));
    
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET, true);
    $base64UrlSignature = base64url_encode($signature);
    
    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

/**
 * Vérifie un JWT et retourne le payload s'il est valide
 */
function verify_jwt($jwt) {
    $tokenParts = explode('.', $jwt);
    if(count($tokenParts) != 3) return false;
    
    $header = base64url_decode($tokenParts[0]);
    $payload = base64url_decode($tokenParts[1]);
    $signature_provided = $tokenParts[2];
    
    $base64UrlHeader = base64url_encode($header);
    $base64UrlPayload = base64url_encode($payload);
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET, true);
    $base64UrlSignature = base64url_encode($signature);
    
    if ($base64UrlSignature === $signature_provided) {
        $data = json_decode($payload, true);
        if(isset($data['exp']) && $data['exp'] < time()) {
            return false; // Token expiré
        }
        return $data; // Token valide
    }
    return false; // Signature invalide
}

/**
 * Extrait le token JWT depuis les headers de la requête HTTP
 */
function get_bearer_token() {
    $headers = null;
    if (isset($_SERVER['Authorization'])) {
        $headers = trim($_SERVER["Authorization"]);
    } else if (isset($_SERVER['HTTP_AUTHORIZATION'])) { // Nginx or fast CGI
        $headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
    } elseif (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        $requestHeaders = array_combine(array_map('ucwords', array_keys($requestHeaders)), array_values($requestHeaders));
        if (isset($requestHeaders['Authorization'])) {
            $headers = trim($requestHeaders['Authorization']);
        }
    }
    
    if (!empty($headers)) {
        if (preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
            return $matches[1];
        }
    }
    return null;
}

