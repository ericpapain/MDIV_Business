<?php
/**
 * API saved_work.php - Historique universel du travail IA rattaché aux clients & projets
 */
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$dbPath = __DIR__ . '/../../dev_db.json';
function getDevDb($path) {
    if (file_exists($path)) {
        return json_decode(file_get_contents($path), true) ?: [];
    }
    return ['savedWorks' => []];
}

function putDevDb($path, $data) {
    file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

$db = getDevDb($dbPath);
if (!isset($db['savedWorks'])) {
    $db['savedWorks'] = [];
}

$method = $_SERVER['REQUEST_METHOD'];
$companyId = isset($_GET['company_id']) ? (int)$_GET['company_id'] : null;
$clientId = isset($_GET['client_id']) ? $_GET['client_id'] : null;
$projectId = isset($_GET['project_id']) ? $_GET['project_id'] : null;
$toolType = isset($_GET['tool_type']) ? $_GET['tool_type'] : null;

if ($method === 'DELETE' || ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'delete')) {
    $raw = json_decode(file_get_contents('php://input'), true) ?: [];
    $deleteId = $_GET['id'] ?? ($raw['id'] ?? null);
    if ($deleteId) {
        $db['savedWorks'] = array_values(array_filter($db['savedWorks'], function($w) use ($deleteId) {
            return (string)$w['id'] !== (string)$deleteId;
        }));
        putDevDb($dbPath, $db);
    }
    echo json_encode(['success' => true, 'message' => "Élément supprimé de l'historique."]);
    exit;
}

if ($method === 'POST') {
    $raw = json_decode(file_get_contents('php://input'), true) ?: [];
    $workId = $raw['id'] ?? ('work_' . time() . '_' . substr(md5(uniqid()), 0, 6));
    
    $item = [
        'id' => $workId,
        'company_id' => isset($raw['company_id']) ? (int)$raw['company_id'] : ($companyId ?: 1),
        'client_id' => $raw['client_id'] ?? ($raw['clientId'] ?? null),
        'client_name' => $raw['client_name'] ?? ($raw['clientName'] ?? 'Client général'),
        'project_id' => $raw['project_id'] ?? ($raw['projectId'] ?? null),
        'project_name' => $raw['project_name'] ?? ($raw['projectName'] ?? null),
        'tool_type' => $raw['tool_type'] ?? ($raw['toolType'] ?? 'general'),
        'title' => trim($raw['title'] ?? 'Travail IA sans titre'),
        'summary' => $raw['summary'] ?? '',
        'content_payload' => $raw['content_payload'] ?? ($raw['contentPayload'] ?? ($raw['data'] ?? [])),
        'version' => $raw['version'] ?? 1,
        'tags' => is_array($raw['tags'] ?? null) ? $raw['tags'] : [],
        'created_at' => $raw['created_at'] ?? date('c'),
        'updated_at' => date('c')
    ];

    $foundIndex = -1;
    foreach ($db['savedWorks'] as $idx => $w) {
        if ((string)$w['id'] === (string)$workId) {
            $foundIndex = $idx;
            break;
        }
    }

    if ($foundIndex >= 0) {
        $db['savedWorks'][$foundIndex] = array_merge($db['savedWorks'][$foundIndex], $item);
    } else {
        array_unshift($db['savedWorks'], $item);
    }
    putDevDb($dbPath, $db);

    echo json_encode(['success' => true, 'savedWork' => $item]);
    exit;
}

// GET
$results = $db['savedWorks'];
if ($companyId) {
    $results = array_filter($results, function($w) use ($companyId) {
        return !isset($w['company_id']) || $w['company_id'] === $companyId;
    });
}
if ($clientId) {
    $results = array_filter($results, function($w) use ($clientId) {
        return (string)($w['client_id'] ?? '') === (string)$clientId;
    });
}
if ($projectId) {
    $results = array_filter($results, function($w) use ($projectId) {
        return (string)($w['project_id'] ?? '') === (string)$projectId;
    });
}
if ($toolType) {
    $results = array_filter($results, function($w) use ($toolType) {
        return (string)($w['tool_type'] ?? '') === (string)$toolType;
    });
}

echo json_encode(array_values($results));
