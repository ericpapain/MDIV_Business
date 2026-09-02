<?php
// Fichier : /api/website_scraper.php

/**
 * Explore un site web d'entreprise pour en extraire le contenu clé (Titre, Meta description, et Texte principal)
 * @param string $url L'URL du site d'entreprise
 * @return string|null Le texte extrait nettoyé ou null si échec
 */
function scrape_website_content($url) {
    if (empty($url)) {
        return null;
    }

    $url = trim($url);

    // Ajouter https:// si non présent
    if (!preg_match("~^(?:f|ht)tps?://~i", $url)) {
        $url = "https://" . $url;
    }

    if (!filter_var($url, FILTER_VALIDATE_URL)) {
        return null;
    }

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_MAXREDIRS, 3);
    curl_setopt($ch, CURLOPT_TIMEOUT, 8); // Max 8s pour ne pas ralentir l'UX
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

    $html = curl_exec($ch);
    $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpcode < 200 || $httpcode >= 400 || empty($html)) {
        return null;
    }

    // Extraire le titre de la page
    $title = '';
    if (preg_match('/<title>(.*?)<\/title>/is', $html, $matches)) {
        $title = html_entity_decode(trim($matches[1]), ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }

    // Extraire la meta description
    $description = '';
    if (preg_match('/<meta[^>]*name=["\']description["\'][^>]*content=["\'](.*?)["\']/is', $html, $matches)) {
        $description = html_entity_decode(trim($matches[1]), ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }

    // Nettoyer les balises inutiles (scripts, styles, svg...)
    $html_clean = preg_replace('/<(script|style|svg|head|noscript|footer|header|nav)[^>]*>.*?<\/\\1>/is', ' ', $html);
    $text = strip_tags($html_clean);
    $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $text = preg_replace('/\s+/', ' ', $text);
    $text = trim($text);

    if (empty($text) && empty($title)) {
        return null;
    }

    $summary = [];
    if (!empty($title)) $summary[] = "Titre du site : " . $title;
    if (!empty($description)) $summary[] = "Description : " . $description;
    if (!empty($text)) $summary[] = "Extrait du contenu : " . mb_substr($text, 0, 3000);

    return implode("\n", $summary);
}
?>
