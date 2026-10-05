<?php
// public/api/prospecting_history.php
require_once __DIR__ . '/config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

echo json_encode([
    [
        'id' => 'camp_1',
        'subject' => 'Optimisation des flux industriels & IA pour Groupe Industriel de l\'Est',
        'content' => "Bonjour Monsieur Dupont,\n\nJe suis avec grand intérêt le développement de vos sites de production...",
        'kpis' => [
            'impactScore' => 93,
            'clarityScore' => 95,
            'personalizationScore' => 91,
            'engagementScore' => 90,
            'estimatedReadTimeSeconds' => 38,
            'persuasionLevel' => 'Très élevé',
            'suggestions' => ['Proposer un audit gratuit de 30 min', 'Mentionner les économies d\'énergie réalisables']
        ],
        'date' => date('d/m/Y H:i')
    ]
], JSON_UNESCAPED_UNICODE);
