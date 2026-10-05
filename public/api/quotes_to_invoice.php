<?php
// public/api/quotes_to_invoice.php
require_once __DIR__ . '/config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$quoteId = $_GET['quote_id'] ?? '';

echo json_encode([
    'invoiceNumber' => 'FAC-' . date('Y') . '-00' . rand(50, 99),
    'clientName' => 'Groupe Industriel de l\'Est',
    'date' => date('Y-m-d'),
    'dueDate' => date('Y-m-d', strtotime('+30 days')),
    'lines' => [
        [
            'id' => '1',
            'description' => 'Audit d\'automatisation et cadrage des processus IA',
            'quantity' => 1,
            'unitPriceHT' => 2400,
            'vatRate' => 20,
            'discountPercentage' => 0
        ]
    ],
    'totalHT' => 2400,
    'vatAmount' => 480,
    'totalTTC' => 2880
], JSON_UNESCAPED_UNICODE);
