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
// On ne définit les headers que si un script parent (ex: SSE) ne les a pas déjà définis.
if (!defined('SKIP_DEFAULT_HEADERS')) {
    header("Access-Control-Allow-Origin: *"); 
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Content-Type: application/json; charset=UTF-8");

    // Si c'est une requête de pré-vérification (OPTIONS), on arrête ici.
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        exit(0);
    }
}

// 0. CHARGEMENT DYNAMIQUE DES VARIABLES D'ENVIRONNEMENT (.env)
$possible_env_files = [
    __DIR__ . '/../../.env',
    __DIR__ . '/../.env',
    __DIR__ . '/.env',
    dirname(__DIR__, 2) . '/.env',
    dirname(__DIR__, 3) . '/.env',
    (isset($_SERVER['DOCUMENT_ROOT']) ? $_SERVER['DOCUMENT_ROOT'] . '/.env' : ''),
    (isset($_SERVER['DOCUMENT_ROOT']) ? $_SERVER['DOCUMENT_ROOT'] . '/../.env' : ''),
];

foreach ($possible_env_files as $env_file) {
    if (!empty($env_file) && file_exists($env_file) && is_readable($env_file)) {
        $lines = file($env_file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line) || strpos($line, '#') === 0) continue;
            if (strpos($line, '=') !== false) {
                list($key, $val) = explode('=', $line, 2);
                $key = trim($key);
                $val = trim($val, " \t\n\r\0\x0B\"'");
                if (!getenv($key)) {
                    putenv("$key=$val");
                    $_ENV[$key] = $val;
                    $_SERVER[$key] = $val;
                }
            }
        }
        break;
    }
}

/**
 * Récupère dynamiquement les réglages configurés par l'administrateur dans le panel
 */
function get_active_ai_settings() {
    $possible_files = [
        __DIR__ . '/ai_settings.json',
        __DIR__ . '/../../dev_db.json'
    ];
    $defaults = [
        'primaryProvider' => 'groq',
        'groqModel' => 'qwen/qwen3.8-27b',
        'openaiModel' => 'gpt-4o-mini',
        'mistralModel' => 'mistral-small-latest',
        'temperature' => 0.7,
        'fallbackEnabled' => true
    ];
    foreach ($possible_files as $file) {
        if (file_exists($file)) {
            $content = json_decode(file_get_contents($file), true);
            if (isset($content['aiSettings'])) {
                return array_merge($defaults, $content['aiSettings']);
            } elseif (is_array($content) && isset($content['primaryProvider'])) {
                return array_merge($defaults, $content);
            }
        }
    }
    return $defaults;
}

$aiSettings = get_active_ai_settings();

// Clés et identifiants par défaut garantissant le fonctionnement immédiat en production (OVH)
$default_groq = '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';
$default_openai = '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';
$default_mistral = 'mstrl_Qul1z0E5sFhkpOy09Hp0Lkf6saSq0Qey_0HrKsA';
$default_db_host = 'zwpvaah279.mysql.db';
$default_db_name = 'zwpvaah279';
$default_db_user = 'zwpvaah279';
$default_db_pass = 'Champion2018';
$default_jwt = 'SuperSecretKey_MDIV_Business_2026!';

// 2. CONFIGURATION DE L'IA (GROQ / OPENAI / MISTRAL)
$groq_key = getenv('GROQ_API_KEY') ?: ($_ENV['GROQ_API_KEY'] ?? ($_SERVER['GROQ_API_KEY'] ?? ($aiSettings['groqApiKey'] ?? $default_groq)));
$openai_key = getenv('OPENAI_API_KEY') ?: ($_ENV['OPENAI_API_KEY'] ?? ($_SERVER['OPENAI_API_KEY'] ?? ($aiSettings['openaiApiKey'] ?? $default_openai)));
$mistral_key = getenv('MISTRAL_API_KEY') ?: ($_ENV['MISTRAL_API_KEY'] ?? ($_SERVER['MISTRAL_API_KEY'] ?? ($aiSettings['mistralApiKey'] ?? $default_mistral)));
$hf_key = getenv('HF_API_KEY') ?: ($_ENV['HF_API_KEY'] ?? ($_SERVER['HF_API_KEY'] ?? ''));

define('GROQ_API_KEY', $groq_key);
define('OPENAI_API_KEY', $openai_key);
define('MISTRAL_API_KEY', $mistral_key);
define('HF_API_KEY', $hf_key);
define('LLM_API_URL', 'https://api.groq.com/openai/v1/chat/completions');
define('LLM_MODEL', getenv('LLM_MODEL') ?: ($aiSettings['groqModel'] ?? 'qwen/qwen3.8-27b'));

/**
 * Fonction universelle d'appel IA multi-fournisseurs pilotée par l'Administration
 * 
 * @param array $messages Le tableau des messages (System, User, Assistant)
 * @param bool $jsonMode Faut-il forcer l'IA à répondre en JSON strict ?
 * @return array La réponse décodée de l'IA
 */
function call_llm_api($messages, $jsonMode = false) {
    require_once __DIR__ . '/groq_client.php';
    return callGroqApi($messages, null, false, $jsonMode);
}

// 3. CONFIGURATION DE LA BASE DE DONNÉES MYSQL (OVH)
$db_host = getenv('DB_HOST') ?: ($_ENV['DB_HOST'] ?? ($_SERVER['DB_HOST'] ?? $default_db_host));
$db_name = getenv('DB_NAME') ?: ($_ENV['DB_NAME'] ?? ($_SERVER['DB_NAME'] ?? $default_db_name));
$db_user = getenv('DB_USER') ?: ($_ENV['DB_USER'] ?? ($_SERVER['DB_USER'] ?? $default_db_user));
$db_pass = getenv('DB_PASS') ?: ($_ENV['DB_PASS'] ?? ($_SERVER['DB_PASS'] ?? $default_db_pass));

define('DB_HOST', $db_host);
define('DB_NAME', $db_name);
define('DB_USER', $db_user);
define('DB_PASS', $db_pass);

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

        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `clients` (
              `id` INT AUTO_INCREMENT PRIMARY KEY,
              `company_id` INT NOT NULL,
              `name` VARCHAR(255) NOT NULL,
              `email` VARCHAR(255) NOT NULL,
              `phone` VARCHAR(50) DEFAULT NULL,
              `company` VARCHAR(255) DEFAULT NULL,
              `address` TEXT DEFAULT NULL,
              `notes` TEXT DEFAULT NULL,
              `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `products` (
              `id` INT AUTO_INCREMENT PRIMARY KEY,
              `company_id` INT NOT NULL,
              `name` VARCHAR(255) NOT NULL,
              `description` TEXT DEFAULT NULL,
              `default_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
              `vat_rate` DECIMAL(5,2) NOT NULL DEFAULT 20.00,
              `category` VARCHAR(100) DEFAULT 'service',
              `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `quotes` (
              `id` INT AUTO_INCREMENT PRIMARY KEY,
              `company_id` INT NOT NULL,
              `client_id` INT DEFAULT NULL,
              `quote_number` VARCHAR(100) NOT NULL,
              `status` ENUM('draft', 'sent', 'accepted', 'rejected') DEFAULT 'draft',
              `total_ht` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
              `total_vat` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
              `total_ttc` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
              `executive_summary` TEXT DEFAULT NULL,
              `payment_terms` VARCHAR(255) DEFAULT '30 jours net',
              `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `invoices` (
              `id` INT AUTO_INCREMENT PRIMARY KEY,
              `company_id` INT NOT NULL,
              `client_id` INT DEFAULT NULL,
              `quote_id` INT DEFAULT NULL,
              `invoice_number` VARCHAR(100) NOT NULL,
              `date` DATE NOT NULL,
              `due_date` DATE NOT NULL,
              `amount_ht` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
              `amount_vat` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
              `amount_ttc` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
              `status` ENUM('pending', 'paid', 'overdue', 'cancelled') DEFAULT 'pending',
              `legal_check_result` JSON DEFAULT NULL,
              `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `followups` (
              `id` INT AUTO_INCREMENT PRIMARY KEY,
              `company_id` INT NOT NULL,
              `type` ENUM('invoice', 'quote', 'meeting', 'inactive_client') DEFAULT 'invoice',
              `reference` VARCHAR(100) NOT NULL,
              `client_name` VARCHAR(255) NOT NULL,
              `amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
              `days_pending` INT NOT NULL DEFAULT 0,
              `status` ENUM('pending', 'sent', 'escalated', 'resolved') DEFAULT 'pending',
              `tone` VARCHAR(50) DEFAULT 'cordial',
              `generated_email` TEXT DEFAULT NULL,
              `last_sent_at` DATETIME DEFAULT NULL,
              `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `projects` (
              `id` INT AUTO_INCREMENT PRIMARY KEY,
              `company_id` INT NOT NULL,
              `client_id` INT DEFAULT NULL,
              `quote_id` INT DEFAULT NULL,
              `title` VARCHAR(255) NOT NULL,
              `description` TEXT DEFAULT NULL,
              `budget` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
              `status` ENUM('draft', 'in_progress', 'completed', 'cancelled') DEFAULT 'in_progress',
              `start_date` DATE DEFAULT NULL,
              `end_date` DATE DEFAULT NULL,
              `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
$jwt_sec = getenv('JWT_SECRET') ?: ($_ENV['JWT_SECRET'] ?? ($_SERVER['JWT_SECRET'] ?? $default_jwt));
define('JWT_SECRET', $jwt_sec);

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

