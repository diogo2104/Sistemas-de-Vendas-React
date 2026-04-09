<?php

require_once __DIR__ . '/../config/database.php';

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');

try {
    $sql = "
        SELECT
            p.id,
            p.nome,
            p.quantidade,
            p.quantidade_minima,
            p.preco_venda,
            c.nome AS categoria_nome,
            f.nome AS fornecedor_nome
        FROM produtos p
        LEFT JOIN categorias c ON c.id = p.categoria_id
        LEFT JOIN fornecedores f ON f.id = p.fornecedor_id
        WHERE p.quantidade <= p.quantidade_minima
        ORDER BY p.quantidade ASC, p.id DESC
    ";

    $stmt = $pdo->query($sql);
    $produtos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($produtos, JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'erro' => 'Erro ao carregar produtos com estoque baixo',
        'detalhes' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}