<?php
/**
 * Script d'envoi d'e-mail sécurisé et formaté en HTML.
 * Sur hébergement mutualisé OVH, la fonction native mail() utilise automatiquement 
 * le serveur SMTP local pré-configuré par OVH.
 */

// Définition des variables d'environnement pour l'expéditeur
define('SMTP_FROM_EMAIL', getenv('SMTP_FROM_EMAIL') ?: 'contact@votredomaine.com');
define('SMTP_FROM_NAME', getenv('SMTP_FROM_NAME') ?: 'MDIV Business IA');

/**
 * Envoie le rapport de diagnostic par e-mail à l'entreprise
 * 
 * @param string $toEmail Email de l'entreprise
 * @param string $companyName Nom de l'entreprise
 * @param array $report Données du rapport JSON (score, synthesis, recommendations...)
 * @return bool True si envoyé, False sinon
 */
function send_diagnostic_report($toEmail, $companyName, $report) {
    $subject = "Votre Rapport de Diagnostic IA - MDIV Business";
    
    // Construction du tableau des recommandations en HTML
    $recommendationsHtml = "";
    if (!empty($report['recommendations'])) {
        foreach ($report['recommendations'] as $rec) {
            $recommendationsHtml .= "<li><strong>" . htmlspecialchars($rec['tool_name']) . "</strong> : " . htmlspecialchars($rec['reason']) . "</li>";
        }
    }

    // Construction des insights déduits (Effet Wow) en HTML
    $insightsHtml = "";
    if (!empty($report['deduced_insights'])) {
        foreach ($report['deduced_insights'] as $insight) {
            $insightsHtml .= "<p style='color: #4a5568; font-style: italic;'>« " . htmlspecialchars($insight) . " »</p>";
        }
    }

    $score = $report['score'] ?? 0;
    $synthesis = htmlspecialchars($report['synthesis'] ?? "Analyse terminée.");

    // Template HTML de l'e-mail
    $message = "
    <html>
    <head>
        <title>Votre Diagnostic IA</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; }
            .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .score-box { text-align: center; margin: 20px 0; padding: 20px; background-color: #f8fafc; border-radius: 8px; }
            .score { font-size: 48px; font-weight: bold; color: #2563eb; }
            .section { margin-bottom: 20px; }
            h2 { color: #1e40af; border-bottom: 2px solid #bfdbfe; padding-bottom: 5px; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #718096; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>MDIV Business</h1>
                <p>Résultats de votre Diagnostic IA</p>
            </div>
            
            <p>Bonjour <strong>$companyName</strong>,</p>
            <p>Nos experts IA ont terminé l'analyse de votre profil. Voici les résultats de votre diagnostic :</p>
            
            <div class='score-box'>
                <p>Votre Score de Maturité IA</p>
                <div class='score'>$score / 100</div>
            </div>

            <div class='section'>
                <h2>Synthèse</h2>
                <p>$synthesis</p>
            </div>

            <div class='section'>
                <h2>Ce que nous avons déduit (Insights cachés)</h2>
                $insightsHtml
            </div>

            <div class='section'>
                <h2>Nos recommandations d'outils</h2>
                <ul>
                    $recommendationsHtml
                </ul>
            </div>
            
            <p>Connectez-vous sur votre Espace Entreprise MDIV Business pour tester ces solutions et accélérer votre transformation.</p>
            
            <div class='footer'>
                <p>Ceci est un e-mail automatique généré par les Agents IA de MDIV Business.</p>
            </div>
        </div>
    </body>
    </html>
    ";

    // En-têtes pour un e-mail HTML propre
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: " . SMTP_FROM_NAME . " <" . SMTP_FROM_EMAIL . ">" . "\r\n";
    $headers .= "Reply-To: " . SMTP_FROM_EMAIL . "\r\n";

    // Envoi via la fonction native (idéale sur OVH mutualisé)
    return mail($toEmail, $subject, $message, $headers);
}
