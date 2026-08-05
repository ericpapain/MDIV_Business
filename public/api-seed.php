<?php
// api-seed.php
header("Content-Type: text/html; charset=UTF-8");

require_once 'api-config.php';

try {
    // Nettoyer les tables avant insertion pour éviter les doublons si cliqué plusieurs fois
    $pdo->exec("TRUNCATE TABLE videos");
    $pdo->exec("TRUNCATE TABLE events");

    // 1. Insertion des Vidéos (Extraites de EventReplay.tsx)
    $videos = [
        ['Cerise - LA FORCE DE LA DIVERSITÉ DES PROFILS', 'KMZT7eYhURA', 'general'],
        ['Témoignage - L\'ÉCOSYSTÈME UNE RÉELLE OPPORTUNITÉ', 'Kvlq85gxpdY', 'general'],
        ['Micke - LA NAISSANCE DU BNE', 'Ycsw4STiU_I', 'general'],
        ['Olivier - L\'IMPORTANCE DU RÉSEAU', 'dJAelLe1ZmY', 'general'],
        ['Partenaire - FOCUS PARTENAIRE', 'X8kX2YtiDuA', 'general']
    ];

    $stmtVid = $pdo->prepare("INSERT INTO videos (title, youtube_id, category) VALUES (?, ?, ?)");
    foreach ($videos as $v) {
        $stmtVid->execute($v);
    }
    echo "<p>✅ 5 Vidéos insérées avec succès.</p>";

    // 2. Insertion des Événements et Séjours (Extraits de mockData.ts)
    // Format: title, date, location, description, type, image_url, status
    $events = [
        [
            'Namaste India', 
            '2026-08-07 19:00:00', 
            '23 boulevard Georges Pompidou, 10003 Troyes, France', 
            'Le rendez-vous des entrepreneurs et dirigeants. Buffet à volonté, networking business et défilé de mode.', 
            'Événement',
            '/assets/india.jpeg'
        ],
        [
            'Sion - Suisse', 
            '2026-10-10 09:00:00', 
            'Sion, Suisse', 
            'Sommet privé dédié à l\'investissement et la préservation de patrimoine.', 
            'Séjour',
            '/assets/avenir.png'
        ],
        [
            'Séjour Fondateur #1', 
            '2026-06-27 10:00:00', 
            'Essoyes, France', 
            'La première édition historique du rassemblement fondateur.', 
            'Séjour',
            '/assets/fondateur.jpg'
        ],
        [
            'Networking Spécial Immobilier #1', 
            '2026-06-19 10:00:00', 
            'Troyes, France', 
            'Rencontre confidentielle entre leaders de l\'immobilier.', 
            'Événement',
            '/assets/immobilier.jpg'
        ]
    ];

    $stmtEv = $pdo->prepare("INSERT INTO events (title, date, location, description, type, image_url) VALUES (?, ?, ?, ?, ?, ?)");
    foreach ($events as $e) {
        $stmtEv->execute($e);
    }
    echo "<p>✅ 4 Événements / Séjours insérés avec succès.</p>";

    echo "<h3>🎉 Opération terminée. Vous pouvez vérifier dans le panneau d'administration !</h3>";
    echo "<p>Pensez à supprimer ce fichier `api-seed.php` de votre serveur par sécurité.</p>";

} catch (PDOException $e) {
    echo "<p>❌ Erreur : " . $e->getMessage() . "</p>";
}
