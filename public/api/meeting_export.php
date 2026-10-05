<?php
// public/api/meeting_export.php
require_once __DIR__ . '/config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$reportId = $_POST['report_id'] ?? $_GET['report_id'] ?? 'meet';
$format = $_POST['format'] ?? 'pdf';

header('Content-Type: text/html; charset=UTF-8');
?>
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Compte-rendu de Réunion - MDIV Business</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: auto; line-height: 1.6; }
    h1 { color: #b45309; border-bottom: 2px solid #f59e0b; padding-bottom: 10px; }
    .meta { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin: 20px 0; }
    .section-title { font-size: 16px; font-weight: bold; margin-top: 25px; color: #0f172a; border-left: 4px solid #b45309; padding-left: 10px; }
    .btn { background: #d97706; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 14px; margin-bottom: 20px; }
    @media print { .btn { display: none; } }
  </style>
</head>
<body>
  <button class="btn" onclick="window.print()">Imprimer / Télécharger en PDF</button>
  <h1>MDIV Business - Compte-rendu de Réunion</h1>
  <div class="meta">
    <strong>Date :</strong> <?= date('d/m/Y') ?><br>
    <strong>Référence :</strong> <?= htmlspecialchars($reportId) ?><br>
    <strong>Participants :</strong> Direction Générale, Équipe Opérationnelle, MDIV Business
  </div>
  <div class="section-title">Synthèse des Échanges</div>
  <p>L'ensemble des objectifs a été revu et approuvé par les participants. Les arbitrages stratégiques permettront de sécuriser le calendrier d'exécution et les investissements prévus.</p>
  <div class="section-title">Décisions & Arbitrages</div>
  <ul>
    <li>Validation du plan de charge et des jalons de livraison.</li>
    <li>Mise à disposition des environnements techniques de test dès la semaine prochaine.</li>
  </ul>
</body>
</html>
