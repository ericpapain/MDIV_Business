<?php
// public/api/invoice_export.php
require_once __DIR__ . '/config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$raw_data = $_POST['invoice_data'] ?? '{}';
$data = json_decode($raw_data, true) ?: [];

$invoiceNumber = $data['invoiceNumber'] ?? ('FAC-' . date('Ymd') . '-01');
$clientName = $data['clientName'] ?? 'Client MDIV';
$lines = $data['lines'] ?? [];
$totalHT = floatval($data['totalHT'] ?? 0);
$totalTTC = floatval($data['totalTTC'] ?? ($totalHT * 1.2));
$vatAmount = floatval($data['vatAmount'] ?? ($totalTTC - $totalHT));

header('Content-Type: text/html; charset=UTF-8');
?>
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Facture <?= htmlspecialchars($invoiceNumber) ?></title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1e293b; max-width: 850px; margin: auto; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 20px; }
    .logo { font-size: 24px; font-weight: bold; color: #b45309; }
    .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin: 20px 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background: #f1f5f9; text-align: left; padding: 10px; font-size: 13px; text-transform: uppercase; color: #475569; }
    td { padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
    .text-right { text-align: right; }
    .total-box { margin-top: 20px; margin-left: auto; width: 300px; }
    .btn { background: #0f172a; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 14px; margin-bottom: 20px; }
    @media print { .btn { display: none; } }
  </style>
</head>
<body>
  <button class="btn" onclick="window.print()">Imprimer / Télécharger en PDF</button>
  
  <div class="header">
    <div>
      <div class="logo">MDIV BUSINESS</div>
      <p style="margin: 5px 0; font-size: 13px; color: #64748b;">Services IA pour Entreprises<br>SIRET : 981 123 456 00012</p>
    </div>
    <div style="text-align: right;">
      <h2 style="margin: 0; color: #0f172a;">FACTURE</h2>
      <p style="margin: 5px 0; font-weight: bold;"><?= htmlspecialchars($invoiceNumber) ?></p>
      <p style="margin: 0; font-size: 13px; color: #64748b;">Date : <?= date('d/m/Y') ?></p>
      <p style="margin: 0; font-size: 13px; color: #64748b;">Échéance : <?= date('d/m/Y', strtotime('+30 days')) ?></p>
    </div>
  </div>

  <div class="box">
    <strong>Facturé à :</strong><br>
    <?= htmlspecialchars($clientName) ?><br>
  </div>

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
      <?php if (!empty($lines)): ?>
        <?php foreach ($lines as $line): 
          $q = floatval($line['quantity'] ?? 1);
          $p = floatval($line['unitPriceHT'] ?? 0);
          $lineTotal = $q * $p;
        ?>
        <tr>
          <td><?= htmlspecialchars($line['description'] ?? '') ?></td>
          <td class="text-right"><?= $q ?></td>
          <td class="text-right"><?= number_format($p, 2, ',', ' ') ?> €</td>
          <td class="text-right"><?= number_format($lineTotal, 2, ',', ' ') ?> €</td>
        </tr>
        <?php endforeach; ?>
      <?php else: ?>
        <tr>
          <td>Prestations de services d'intelligence artificielle</td>
          <td class="text-right">1</td>
          <td class="text-right"><?= number_format($totalHT, 2, ',', ' ') ?> €</td>
          <td class="text-right"><?= number_format($totalHT, 2, ',', ' ') ?> €</td>
        </tr>
      <?php endif; ?>
    </tbody>
  </table>

  <div class="total-box">
    <table>
      <tr>
        <td><strong>Total HT :</strong></td>
        <td class="text-right"><?= number_format($totalHT, 2, ',', ' ') ?> €</td>
      </tr>
      <tr>
        <td>TVA (20%) :</td>
        <td class="text-right"><?= number_format($vatAmount, 2, ',', ' ') ?> €</td>
      </tr>
      <tr style="font-size: 16px; font-weight: bold; background: #e2e8f0;">
        <td>Total TTC :</td>
        <td class="text-right"><?= number_format($totalTTC, 2, ',', ' ') ?> €</td>
      </tr>
    </table>
  </div>

  <div style="margin-top: 30px; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 15px;">
    Règlement par virement bancaire sous 30 jours. Pas d'escompte pour paiement anticipé.<br>
    En cas de retard de paiement, pénalité de 3 fois le taux d'intérêt légal + indemnité forfaitaire de 40 € pour frais de recouvrement.
  </div>
</body>
</html>
