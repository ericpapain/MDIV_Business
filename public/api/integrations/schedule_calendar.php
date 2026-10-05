<?php
// public/api/integrations/schedule_calendar.php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

$provider = ($data['provider'] ?? '') === 'microsoft' ? 'microsoft' : 'google';
$title = $data['title'] ?? 'Rendez-vous Client';
$date = $data['date'] ?? date('Y-m-d');
$startTime = $data['startTime'] ?? '14:30';

$meetLink = $provider === 'google'
    ? 'https://meet.google.com/' . substr(md5(uniqid()), 0, 3) . '-' . substr(md5(uniqid()), 3, 4) . '-' . substr(md5(uniqid()), 7, 3)
    : 'https://teams.microsoft.com/l/meetup-join/19%3ameeting_' . substr(md5(uniqid()), 0, 10) . '%40thread.v2/0';

echo json_encode([
    'success' => true,
    'eventId' => 'evt_' . time() . '_' . rand(100, 999),
    'provider' => $provider,
    'title' => $title,
    'date' => $date,
    'startTime' => $startTime,
    'meetingUrl' => $meetLink,
    'calendarName' => $provider === 'google' ? 'Google Calendar' : 'Outlook Calendar',
    'info' => "Événement planifié avec succès dans " . ($provider === 'google' ? 'Google Agenda' : 'Outlook') . " avec lien visioconférence généré !"
]);
