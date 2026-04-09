<?php

require_once __DIR__ . '/../config/database.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'erro' => 'Método não permitido.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$dados = json_decode(file_get_contents('php://input'), true);

$cliente_id = $dados['cliente_id'] ?? null;
$forma_pagamento_id = $dados['forma_pagamento_id'] ?? null;
$tipo_pagamento = $dados['tipo_pagamento'] ?? 'avista';
$desconto = $dados['desconto'] ?? 0;
$acrescimo = $dados['acrescimo'] ?? 0;
$observacao = trim($dados['observacao'] ?? '');
$itens = $dados['itens'] ?? [];
$vencimento = $dados['vencimento'] ?? null;

if (!$cliente_id) {
    http_response_code(400);
    echo json_encode([
        'erro' => 'Cliente é obrigatório.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if (empty($itens) || !is_array($itens)) {
    http_response_code(400);
    echo json_encode([
        'erro' => 'A venda precisa ter pelo menos um item.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $pdo->beginTransaction();

    $valor_total_itens = 0;

    foreach ($itens as $item) {
        $produto_id = $item['produto_id'] ?? null;
        $quantidade = (int) ($item['quantidade'] ?? 0);

        if (!$produto_id || $quantidade <= 0) {
            throw new Exception('Item de venda inválido.');
        }

        $stmtProduto = $pdo->prepare("SELECT * FROM produtos WHERE id = :id LIMIT 1");
        $stmtProduto->execute([':id' => $produto_id]);
        $produto = $stmtProduto->fetch(PDO::FETCH_ASSOC);

        if (!$produto) {
            throw new Exception("Produto ID {$produto_id} não encontrado.");
        }

        if ((int)$produto['quantidade'] < $quantidade) {
            throw new Exception("Estoque insuficiente para o produto {$produto['nome']}.");
        }

        $preco_unitario = (float) $produto['preco_venda'];
        $subtotal = $preco_unitario * $quantidade;
        $valor_total_itens += $subtotal;
    }

    $valor_total = $valor_total_itens - (float)$desconto + (float)$acrescimo;

    if ($valor_total < 0) {
        $valor_total = 0;
    }

    $stmtVenda = $pdo->prepare("
        INSERT INTO vendas (
            cliente_id,
            forma_pagamento_id,
            valor_total,
            desconto,
            acrescimo,
            tipo_pagamento,
            observacao
        ) VALUES (
            :cliente_id,
            :forma_pagamento_id,
            :valor_total,
            :desconto,
            :acrescimo,
            :tipo_pagamento,
            :observacao
        )
    ");

    $stmtVenda->execute([
        ':cliente_id' => $cliente_id,
        ':forma_pagamento_id' => $forma_pagamento_id,
        ':valor_total' => $valor_total,
        ':desconto' => $desconto,
        ':acrescimo' => $acrescimo,
        ':tipo_pagamento' => $tipo_pagamento,
        ':observacao' => $observacao !== '' ? $observacao : null
    ]);

    $venda_id = $pdo->lastInsertId();

    foreach ($itens as $item) {
        $produto_id = $item['produto_id'] ?? null;
        $quantidade = (int) ($item['quantidade'] ?? 0);

        $stmtProduto = $pdo->prepare("SELECT * FROM produtos WHERE id = :id LIMIT 1");
        $stmtProduto->execute([':id' => $produto_id]);
        $produto = $stmtProduto->fetch(PDO::FETCH_ASSOC);

        $preco_unitario = (float) $produto['preco_venda'];
        $subtotal = $preco_unitario * $quantidade;

        $stmtItem = $pdo->prepare("
            INSERT INTO itens_venda (
                venda_id,
                produto_id,
                quantidade,
                preco_unitario,
                subtotal
            ) VALUES (
                :venda_id,
                :produto_id,
                :quantidade,
                :preco_unitario,
                :subtotal
            )
        ");

        $stmtItem->execute([
            ':venda_id' => $venda_id,
            ':produto_id' => $produto_id,
            ':quantidade' => $quantidade,
            ':preco_unitario' => $preco_unitario,
            ':subtotal' => $subtotal
        ]);

        $nova_quantidade = (int)$produto['quantidade'] - $quantidade;

        $stmtUpdateProduto = $pdo->prepare("
            UPDATE produtos
            SET quantidade = :quantidade
            WHERE id = :id
        ");

        $stmtUpdateProduto->execute([
            ':quantidade' => $nova_quantidade,
            ':id' => $produto_id
        ]);

        $stmtMovimentacao = $pdo->prepare("
            INSERT INTO movimentacoes_estoque (
                produto_id,
                tipo,
                quantidade,
                observacao
            ) VALUES (
                :produto_id,
                'saida',
                :quantidade,
                :observacao
            )
        ");

        $stmtMovimentacao->execute([
            ':produto_id' => $produto_id,
            ':quantidade' => $quantidade,
            ':observacao' => "Saída por venda #{$venda_id}"
        ]);
    }

    if ($tipo_pagamento === 'aprazo') {
        if (!$vencimento) {
            throw new Exception('Vencimento é obrigatório para vendas a prazo.');
        }

        $stmtConta = $pdo->prepare("
            INSERT INTO contas_receber (
                venda_id,
                cliente_id,
                descricao,
                valor,
                vencimento,
                status
            ) VALUES (
                :venda_id,
                :cliente_id,
                :descricao,
                :valor,
                :vencimento,
                'pendente'
            )
        ");

        $stmtConta->execute([
            ':venda_id' => $venda_id,
            ':cliente_id' => $cliente_id,
            ':descricao' => "Venda a prazo #{$venda_id}",
            ':valor' => $valor_total,
            ':vencimento' => $vencimento
        ]);
    }

    $pdo->commit();

    http_response_code(201);
    echo json_encode([
        'mensagem' => 'Venda registrada com sucesso.',
        'venda_id' => $venda_id,
        'valor_total' => $valor_total
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);
    echo json_encode([
        'erro' => 'Erro ao registrar venda',
        'detalhes' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}