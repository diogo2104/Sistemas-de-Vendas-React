<?php

require_once __DIR__ . '/../config/database.php';

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');

$id = $_GET['id'] ?? null;

if (!$id) {
    http_response_code(400);
    echo json_encode([
        'erro' => 'ID da venda não informado.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $sqlVenda = "
        SELECT
            v.*,
            c.nome AS cliente_nome,
            fp.nome AS forma_pagamento_nome
        FROM vendas v
        INNER JOIN clientes c ON c.id = v.cliente_id
        LEFT JOIN formas_pagamento fp ON fp.id = v.forma_pagamento_id
        WHERE v.id = :id
        LIMIT 1
    ";

    $stmtVenda = $pdo->prepare($sqlVenda);
    $stmtVenda->bindValue(':id', $id, PDO::PARAM_INT);
    $stmtVenda->execute();

    $venda = $stmtVenda->fetch(PDO::FETCH_ASSOC);

    if (!$venda) {
        http_response_code(404);
        echo json_encode([
            'erro' => 'Venda não encontrada.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $sqlItens = "
        SELECT
            iv.*,
            p.nome AS produto_nome
        FROM itens_venda iv
        INNER JOIN produtos p ON p.id = iv.produto_id
        WHERE iv.venda_id = :venda_id
        ORDER BY iv.id ASC
    ";

    $stmtItens = $pdo->prepare($sqlItens);
    $stmtItens->bindValue(':venda_id', $id, PDO::PARAM_INT);
    $stmtItens->execute();

    $itens = $stmtItens->fetchAll(PDO::FETCH_ASSOC);

    $venda['itens'] = $itens;

    echo json_encode($venda, JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'erro' => 'Erro ao buscar venda',
        'detalhes' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}