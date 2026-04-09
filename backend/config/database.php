<?php

header('Content-Type: application/json; charset=utf-8');

$host = '127.0.0.1';
$dbname = 'sales_system';
$user = 'root';
$password = '';
$port = 3306;

try {
    $pdo = new PDO(
        "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4",
        $user,
        $password
    );

    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'erro' => 'Erro ao conectar ao banco de dados',
        'detalhes' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
    exit;
}