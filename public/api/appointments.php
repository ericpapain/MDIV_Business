<?php
// public/api/appointments.php
// Gestion complète des rendez-vous en ligne 24h/24 et planning professionnel MDIV Business
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';

$pdo = get_db_connection();
$devDbPath = __DIR__ . '/../../dev_db.json';
$method = $_SERVER['REQUEST_METHOD'];
$companyId = isset($_GET['company_id']) ? intval($_GET['company_id']) : 4;

// 1. GET: Récupération de la liste des rendez-vous
if ($method === 'GET') {
    if ($pdo) {
        try {
            $stmt = $pdo->prepare("SELECT * FROM appointments WHERE company_id = ? ORDER BY date ASC, time ASC");
            $stmt->execute([$companyId]);
            $list = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($list, JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            // Repli sur dev_db.json
        }
    }

    $db = file_exists($devDbPath) ? json_decode(file_get_contents($devDbPath), true) : [];
    $all = $db['appointments'] ?? [];
    $list = array_values(array_filter($all, fn($a) => empty($a['company_id']) || intval($a['company_id']) === $companyId));
    usort($list, function($a, $b) {
        $dtA = strtotime(($a['date'] ?? '') . ' ' . ($a['time'] ?? '00:00'));
        $dtB = strtotime(($b['date'] ?? '') . ' ' . ($b['time'] ?? '00:00'));
        return $dtA - $dtB;
    });
    echo json_encode($list, JSON_UNESCAPED_UNICODE);
    exit;
}

// 2. POST: Création d'un rendez-vous (depuis la page publique client ou le dashboard)
if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?: $_POST;

    $targetCompanyId = intval($data['company_id'] ?? $companyId);
    $clientName = trim($data['client_name'] ?? '');

    if (empty($clientName)) {
        http_response_code(400);
        echo json_encode(['error' => 'Le nom du client est obligatoire pour bloquer le créneau.']);
        exit;
    }

    $id = !empty($data['id']) ? $data['id'] : 'apt-' . time() . '-' . rand(100, 999);
    $date = $data['date'] ?? date('Y-m-d');
    $time = $data['time'] ?? '14:00';
    $duration = intval($data['duration_minutes'] ?? 45);
    $type = $data['appointment_type'] ?? 'visite_chantier';
    $title = $data['title'] ?? ($type === 'visio_diagnostic' ? 'Échange préliminaire en visio' : 'Visite technique sur chantier');
    $location = $data['location'] ?? 'Sur place / Chantier';
    $email = trim($data['client_email'] ?? '');
    $phone = trim($data['client_phone'] ?? '');
    $notes = trim($data['notes'] ?? '');
    $source = $data['source'] ?? 'online_booking';
    $token = $data['booking_link_token'] ?? null;
    $meetingUrl = $data['meeting_url'] ?? ($type === 'visio_diagnostic' ? 'https://meet.google.com/mdiv-' . substr(md5(uniqid()), 0, 7) : '');

    $newAppointment = [
        'id' => $id,
        'company_id' => $targetCompanyId,
        'client_name' => $clientName,
        'client_email' => $email,
        'client_phone' => $phone,
        'appointment_type' => $type,
        'title' => $title,
        'date' => $date,
        'time' => $time,
        'duration_minutes' => $duration,
        'location' => $location,
        'notes' => $notes,
        'status' => 'confirmed',
        'source' => $source,
        'booking_link_token' => $token,
        'meeting_url' => $meetingUrl,
        'created_at' => date('c'),
        'reminders_sent' => [
            'email_confirmation' => true,
            'sms_reminder' => !empty($phone)
        ]
    ];

    if ($pdo) {
        try {
            $stmt = $pdo->prepare("
                INSERT INTO appointments (id, company_id, booking_link_token, client_name, client_email, client_phone, appointment_type, title, date, time, duration_minutes, location, notes, status, source, meeting_url)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $id, $targetCompanyId, $token, $clientName, $email, $phone,
                $type, $title, $date, $time, $duration, $location, $notes,
                'confirmed', $source, $meetingUrl
            ]);

            // Notification
            $notifId = 'notif-' . time() . '-' . rand(100, 999);
            $stmtN = $pdo->prepare("
                INSERT INTO appointment_notifications (id, company_id, appointment_id, type, title, message, is_read)
                VALUES (?, ?, ?, 'new_booking', 'Nouvelle réservation reçue !', ?, 0)
            ");
            $notifMsg = "{$clientName} a réservé pour le {$date} à {$time} ({$duration} min).";
            $stmtN->execute([$notifId, $targetCompanyId, $id, $notifMsg]);

            echo json_encode(['success' => true, 'appointment' => $newAppointment], JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            // Repli sur dev_db.json
        }
    }

    $db = file_exists($devDbPath) ? json_decode(file_get_contents($devDbPath), true) : [];
    if (!isset($db['appointments'])) $db['appointments'] = [];
    array_unshift($db['appointments'], $newAppointment);

    if (!isset($db['appointment_notifications'])) $db['appointment_notifications'] = [];
    array_unshift($db['appointment_notifications'], [
        'id' => 'notif-' . time() . '-' . rand(100, 999),
        'company_id' => $targetCompanyId,
        'appointment_id' => $id,
        'type' => 'new_booking',
        'title' => 'Nouvelle réservation reçue !',
        'message' => "{$clientName} a réservé pour le {$date} à {$time} ({$duration} min).",
        'read' => false,
        'created_at' => date('c')
    ]);

    // Lier au CRM
    if (!isset($db['clients'])) $db['clients'] = [];
    $exists = false;
    foreach ($db['clients'] as $c) {
        if (strcasecmp($c['name'] ?? '', $clientName) === 0 || (!empty($email) && strcasecmp($c['email'] ?? '', $email) === 0)) {
            $exists = true;
            break;
        }
    }
    if (!$exists) {
        array_unshift($db['clients'], [
            'id' => time(),
            'company_id' => $targetCompanyId,
            'name' => $clientName,
            'company' => $clientName,
            'email' => $email,
            'phone' => $phone,
            'address' => $location,
            'notes' => "Créé automatiquement suite à une réservation en ligne ({$type})",
            'createdAt' => date('c')
        ]);
    }

    file_put_contents($devDbPath, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    echo json_encode(['success' => true, 'appointment' => $newAppointment], JSON_UNESCAPED_UNICODE);
    exit;
}

// 3. PUT: Mise à jour ou annulation / reprogrammation
if ($method === 'PUT') {
    $id = $_GET['id'] ?? null;
    $raw = file_get_contents('php://input');
    $fields = json_decode($raw, true) ?: [];

    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Identifiant du rendez-vous manquant.']);
        exit;
    }

    $db = file_exists($devDbPath) ? json_decode(file_get_contents($devDbPath), true) : [];
    if (!isset($db['appointments'])) $db['appointments'] = [];

    $foundIndex = -1;
    foreach ($db['appointments'] as $idx => $a) {
        if (strval($a['id']) === strval($id)) {
            $foundIndex = $idx;
            break;
        }
    }

    if ($foundIndex === -1) {
        http_response_code(404);
        echo json_encode(['error' => 'Rendez-vous introuvable.']);
        exit;
    }

    $prev = $db['appointments'][$foundIndex];
    $updated = array_merge($prev, $fields, [
        'id' => $prev['id'],
        'updated_at' => date('c')
    ]);
    $db['appointments'][$foundIndex] = $updated;

    if (!isset($db['appointment_notifications'])) $db['appointment_notifications'] = [];
    if (($fields['status'] ?? '') === 'cancelled') {
        array_unshift($db['appointment_notifications'], [
            'id' => 'notif-' . time() . '-' . rand(100, 999),
            'company_id' => $prev['company_id'] ?? 4,
            'appointment_id' => $prev['id'],
            'type' => 'cancelled',
            'title' => 'Rendez-vous annulé',
            'message' => "{$prev['client_name']} a annulé son rendez-vous du {$prev['date']} à {$prev['time']}.",
            'read' => false,
            'created_at' => date('c')
        ]);
    }

    file_put_contents($devDbPath, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    echo json_encode(['success' => true, 'appointment' => $updated], JSON_UNESCAPED_UNICODE);
    exit;
}

// 4. DELETE: Suppression
if ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    $db = file_exists($devDbPath) ? json_decode(file_get_contents($devDbPath), true) : [];
    if (isset($db['appointments'])) {
        $db['appointments'] = array_values(array_filter($db['appointments'], fn($a) => strval($a['id']) !== strval($id)));
        file_put_contents($devDbPath, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }
    echo json_encode(['success' => true]);
    exit;
}
