<?php
// public/api/document_parser.php
// Service d'extraction documentaire universel côté serveur (Word DOCX, PDF, Fichiers texte)

/**
 * Extrait le texte d'un document Word DOCX (.docx) via l'archive interne word/document.xml
 */
function extractTextFromDocxFile($filePath) {
    if (!file_exists($filePath) || !class_exists('ZipArchive')) {
        return '';
    }

    $zip = new ZipArchive();
    $text = '';

    if ($zip->open($filePath) === TRUE) {
        $xml = $zip->getFromName('word/document.xml');
        $zip->close();

        if ($xml) {
            // Remplacer les fins de paragraphes, de lignes et de cellules par des sauts de ligne
            $xml = str_replace(
                ['</w:p>', '</w:tr>', '<w:tab/>', '<w:br/>'], 
                ["\n", "\n", "\t", "\n"], 
                $xml
            );
            $text = strip_tags($xml);
            // Nettoyer les espaces multiples
            $text = preg_replace('/[ \t]+/', ' ', $text);
            $text = preg_replace('/\n\s*\n/', "\n\n", $text);
            $text = trim($text);
        }
    }

    return $text;
}

/**
 * Extrait le texte d'un PDF en analysant les flux binaires décompressés (FlateDecode)
 */
function extractTextFromPdfFile($filePath) {
    if (!file_exists($filePath)) {
        return '';
    }

    $content = @file_get_contents($filePath);
    if (!$content) {
        return '';
    }

    $text = '';

    // 1. Extraire et décompresser les streams FlateDecode
    if (preg_match_all('/stream[\r\n]+(.*?)[\r\n]+endstream/s', $content, $streams)) {
        foreach ($streams[1] as $stream) {
            $uncompressed = @gzuncompress($stream);
            if ($uncompressed) {
                // Recherche des chaînes dans les blocs textuels Tj / TJ
                if (preg_match_all('/\((.*?)\)[\r\n]*Tj/s', $uncompressed, $m)) {
                    $text .= implode(' ', $m[1]) . " ";
                }
                if (preg_match_all('/\[(.*?)\][\r\n]*TJ/s', $uncompressed, $m)) {
                    foreach ($m[1] as $tjGroup) {
                        if (preg_match_all('/\((.*?)\)/s', $tjGroup, $inner)) {
                            $text .= implode('', $inner[1]) . " ";
                        }
                    }
                }
            }
        }
    }

    // 2. Recherche textuelle brute dans le flux non-compressé si nécessaire
    if (strlen(trim($text)) < 30) {
        if (preg_match_all('/\((.*?)\)[\r\n]*Tj/s', $content, $m)) {
            $text .= implode(' ', $m[1]);
        }
    }

    // Nettoyer les caractères d'échappement PDF
    $text = str_replace(['\\(', '\\)', '\\\\'], ['(', ')', '\\'], $text);
    $text = preg_replace('/\s+/', ' ', $text);

    return trim($text);
}

/**
 * Analyse et extrait le texte d'un fichier uploadé selon son extension
 */
function parseUploadedFileContent($filePath, $fileName, $clientExtractedText = '') {
    // Si le client (navigateur via PDF.js / Mammoth) a déjà extrait le texte avec succès, on le priorise
    if (!empty(trim($clientExtractedText)) && strlen(trim($clientExtractedText)) > 20) {
        return trim($clientExtractedText);
    }

    $ext = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

    if (in_array($ext, ['txt', 'md', 'csv', 'json', 'log', 'xml'])) {
        return @file_get_contents($filePath) ?: '';
    }

    if ($ext === 'docx') {
        $extracted = extractTextFromDocxFile($filePath);
        if (!empty($extracted)) {
            return $extracted;
        }
    }

    if ($ext === 'pdf') {
        $extracted = extractTextFromPdfFile($filePath);
        if (!empty($extracted)) {
            return $extracted;
        }
    }

    return '';
}
