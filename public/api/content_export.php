<?php
// public/api/content_export.php
require_once __DIR__ . '/config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$raw_data = $_POST['content_data'] ?? '[]';
$contents = json_decode($raw_data, true) ?: [];

header('Content-Type: text/html; charset=UTF-8');
?>
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Contenus générés - MDIV Business</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: auto; line-height: 1.6; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 25px; }
    .channel { display: inline-block; background: #d97706; color: white; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; margin-bottom: 10px; }
    .btn { background: #d97706; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 14px; margin-bottom: 20px; }
    @media print { .btn { display: none; } }
  </style>
</head>
<body>
  <button class="btn" onclick="window.print()">Imprimer / Sauvegarder</button>
  <h1>MDIV Business - Contenus Éditoriaux Multi-Canaux</h1>
  <p style="color: #64748b;">Date : <?= date('d/m/Y H:i') ?></p>

  <?php if (!empty($contents)): ?>
    <?php foreach ($contents as $item): ?>
      <div class="card">
        <span class="channel"><?= htmlspecialchars($item['channel'] ?? 'Canal') ?></span>
        <?php if (!empty($item['title'])): ?>
          <h3 style="margin-top: 5px;"><?= htmlspecialchars($item['title']) ?></h3>
        <?php endif; ?>
        <p style="white-space: pre-wrap;"><?= htmlspecialchars($item['body'] ?? '') ?></p>
        <?php if (!empty($item['hashtags'])): ?>
          <p style="color: #0284c7; font-size: 13px;"><?= implode(' ', array_map('htmlspecialchars', $item['hashtags'])) ?></p>
        <?php endif; ?>
      </div>
    <?php endforeach; ?>
  <?php else: ?>
    <p>Aucun contenu à exporter.</p>
  <?php endif; ?>
</body>
</html>
