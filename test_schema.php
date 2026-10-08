<?php
require 'public/api-config.php';

try {
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    $schema = "";
    
    foreach ($tables as $table) {
        $schema .= "-- Table: $table\n";
        $createStmt = $pdo->query("SHOW CREATE TABLE `$table`");
        $create = $createStmt->fetch(PDO::FETCH_ASSOC);
        $schema .= $create['Create Table'] . ";\n\n";
    }
    
    file_put_contents('schema_dump.sql', $schema);
    echo "SUCCESS";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
