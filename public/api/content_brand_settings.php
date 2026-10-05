<?php
// public/api/content_brand_settings.php
require_once __DIR__ . '/config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

echo json_encode([
    'tone' => 'Professionnel, visionnaire et axé sur les résultats concrets',
    'editorialGuide' => 'Privilégier les exemples chiffrés, le pragmatisme opérationnel et la souveraineté des données d\'entreprise.',
    'keywords' => 'Intelligence Artificielle, ROI, Transformation Digitale, Automatisation, Productivité, PME'
], JSON_UNESCAPED_UNICODE);
