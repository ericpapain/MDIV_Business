<?php
// public/api/quote_export.php
require_once __DIR__ . '/config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$raw_data = $_POST['quote_data'] ?? '{}';
$data = json_decode($raw_data, true) ?: [];

$client = $data['client'] ?? [];
$lines = $data['lines'] ?? [];
$summary = $data['executiveSummary'] ?? '';
$paymentTerms = $data['paymentTerms'] ?? 'Paiement à 30 jours date d\'émission.';

$quoteNumber = 'DEV-' . date('Ymd') . '-001';

header('Content-Type: text/html; charset=UTF-8');
?>
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Devis <?= htmlspecialchars($quoteNumber) ?> - MDIV Business</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1e293b; max-width: 850px; margin: auto; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #b45309; padding-bottom: 20px; }
    .logo { font-size: 24px; font-weight: bold; color: #b45309; letter-spacing: 1px; }
    .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin: 20px 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background: #f1f5f9; text-align: left; padding: 10px; font-size: 13px; text-transform: uppercase; color: #475569; }
    td { padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
    .text-right { text-align: right; }
    .total-box { margin-top: 20px; margin-left: auto; width: 300px; }
    .btn { background: #d97706; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 14px; margin-bottom: 20px; }
    @media print { .btn { display: none; } }
  </style>
</head>
<body>
  <button class="btn" onclick="window.print()">Imprimer / Télécharger en PDF</button>
  
  <div class="header">
    <div>
      <div class="logo">MDIV BUSINESS</div>
      <p style="margin: 5px 0; font-size: 13px; color: #64748b;">Solutions IA & Performance Entreprise<br>SIRET : 981 123 456 00012</p>
    </div>
    <div style="text-align: right;">
      <h2 style="margin: 0; color: #b45309;">DEVIS</h2>
      <p style="margin: 5px 0; font-weight: bold;"><?= htmlspecialchars($quoteNumber) ?></p>
      <p style="margin: 0; font-size: 13px; color: #64748b;">Date : <?= date('d/m/Y') ?></p>
    </div>
  </div>

  <div class="box">
    <strong>Destinataire :</strong><br>
    <?= htmlspecialchars($client['company'] ?? 'Société cliente') ?><br>
    À l'attention de : <?= htmlspecialchars($client['name'] ?? 'Responsable des Achats') ?><br>
    <?= htmlspecialchars($client['address'] ?? '') ?>
  </div>

  <?php if (!empty($summary)): ?>
  <div style="font-size: 14px; line-height: 1.5; margin: 15px 0;">
    <strong>Objet / Synthèse :</strong> <?= htmlspecialchars($summary) ?>
  </div>
  <?php endif; ?>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th class="text-right">Qté</th>
        <th class="text-right">Prix Unit. HT</th>
        <th class="text-right">Total HT</th>
      </tr>
    </thead>
    <tbody>
      <?php 
      $totalHT = 0;
      if (!empty($lines)): 
        foreach ($lines as $line):
          $q = floatval($line['quantity'] ?? 1);
          $p = floatval($line['unitPriceHT'] ?? 0);
          $disc = floatval($line['discountPercentage'] ?? 0);
          $lineTotal = ($q * $p) * (1 - $disc / 100);
          $totalHT += $lineTotal;
      ?>
      <tr>
        <td><?= htmlspecialchars($line['description'] ?? '') ?></td>
        <td class="text-right"><?= $q ?></td>
        <td class="text-right"><?= number_format($p, 2, ',', ' ') ?> €</td>
        <td class="text-right"><?= number_format($lineTotal, 2, ',', ' ') ?> €</td>
      </tr>
      <?php 
        endforeach;
      else: ?>
      <tr>
        <td colspan="4">Prestation de conseil et diagnostic IA sur mesure</td>
      </tr>
      <?php endif; ?>
    </tbody>
  </table>

  <?php 
  $tva = $totalHT * 0.20; 
  $totalTTC = $totalHT + $tva;
  ?>
  <div class="total-box">
    <table>
      <tr>
        <td><strong>Total HT :</strong></td>
        <td class="text-right"><?= number_format($totalHT, 2, ',', ' ') ?> €</td>
      </tr>
      <tr>
        <td>TVA (20%) :</td>
        <td class="text-right"><?= number_format($tva, 2, ',', ' ') ?> €</td>
      </tr>
      <tr style="font-size: 16px; font-weight: bold; background: #fef3c7;">
        <td>Total TTC :</td>
        <td class="text-right"><?= number_format($totalTTC, 2, ',', ' ') ?> €</td>
      </tr>
    </table>
  </div>

  <div style="margin-top: 30px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 15px;">
    <strong>Conditions de règlement :</strong> <?= htmlspecialchars($paymentTerms) ?><br>
    Bon pour accord et signature :
  </div>
</body>
</html>
