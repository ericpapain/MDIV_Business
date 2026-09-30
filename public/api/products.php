<?php
// public/api/products.php
require_once __DIR__ . '/config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    $company_id = isset($_GET['company_id']) ? intval($_GET['company_id']) : null;
    try {
        $pdo = get_db_connection();
        if ($company_id) {
            $stmt = $pdo->prepare("SELECT id, name, description, default_price as defaultPrice, vat_rate as vatRate FROM products WHERE company_id = ? ORDER BY id DESC LIMIT 50");
            $stmt->execute([$company_id]);
        } else {
            $stmt = $pdo->query("SELECT id, name, description, default_price as defaultPrice, vat_rate as vatRate FROM products ORDER BY id DESC LIMIT 50");
        }
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if (!empty($products)) {
            echo json_encode($products, JSON_UNESCAPED_UNICODE);
            exit;
        }
    } catch (Exception $e) {
        // Fallback catalogue
    }

    $defaultProducts = [
        [
            'id' => 'prod_1',
            'reference' => 'MDIV-AUDIT-01',
            'name' => 'Audit de Maturité IA & Automatisation',
            'description' => 'Diagnostic complet 360° des processus métiers, cartographie des flux et recommandations chiffrées de ROI.',
            'defaultPrice' => 2400,
            'vatRate' => 20
        ],
        [
            'id' => 'prod_2',
            'reference' => 'MDIV-AGENT-02',
            'name' => 'Déploiement d\'Agents IA Spécialisés',
            'description' => 'Mise en place de pipeline multi-agents sur mesure connectés au CRM et outils métiers.',
            'defaultPrice' => 4800,
            'vatRate' => 20
        ],
        [
            'id' => 'prod_3',
            'reference' => 'MDIV-FORM-03',
            'name' => 'Formation & Acculturation des Équipes',
            'description' => 'Session d\'accompagnement intensif et ateliers pratiques de prompting avancé pour cadres et équipes.',
            'defaultPrice' => 1500,
            'vatRate' => 20
        ]
    ];

    echo json_encode($defaultProducts, JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode([]);
}
