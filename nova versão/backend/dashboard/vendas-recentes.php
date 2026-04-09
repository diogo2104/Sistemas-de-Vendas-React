<?php

require_once __DIR__ . '/../config/database.php';

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');

try {
    $sql = "
        SELECT
            v.id,
            v.data_venda,
            v.valor_total,
            v.tipo_pagamento,
            v.status,
            c.nome AS cliente_nome,
            fp.nome AS forma_pagamento_nome
        FROM vendas v
        INNER JOIN clientes c ON c.id = v.cliente_id
        LEFT JOIN formas_pagamento fp ON fp.id = v.forma_pagamento_id
        ORDER BY v.data_venda DESC, v.id DESC
        LIMIT 10
    ";

    $stmt = $pdo->query($sql);
    $vendas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($vendas, JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'erro' => 'Erro ao carregar vendas recentes',
        'detalhes' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}