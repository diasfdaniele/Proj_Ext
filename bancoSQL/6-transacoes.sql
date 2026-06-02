#Transações

#Venda de produto com atualização automática do estoque.
START TRANSACTION;

	INSERT INTO pedidos(
		fk_comprador,
		fk_endereco,
		metodo_pagamento,
		parcelamento,
		status_pedido,
		total_estimado
	)
	VALUES(
		11,
		11,
		'PIX',
		'1x',
		'Aberto',
		1700.00
	);

	SET @pedido = LAST_INSERT_ID();

	INSERT INTO itens_pedido(
		fk_pedido,
		fk_produto,
		nome_produto,
		empresa_vendedora,
		categoria,
		quantidade,
		preco_venda,
		subtotal
	)
	VALUES(
		@pedido,
		6,
		'Cadeira de Rodas Manual',
		'Mobility Brasil',
		'Mobilidade',
		2,
		850.00,
		1700.00
	);

	UPDATE produtos
	SET estoque_atual = estoque_atual - 2
	WHERE id_produto = 6;

COMMIT;


#Caso o estoque seja menor do que a quantidade solicitada
START TRANSACTION;

	INSERT INTO pedidos(
		fk_comprador,
		fk_endereco,
		metodo_pagamento,
		parcelamento,
		status_pedido,
		total_estimado
	)
	VALUES(
		12,
		12,
		'Boleto',
		'1x',
		'Aberto',
		8500000.00
	);

	SET @pedido = LAST_INSERT_ID();

	INSERT INTO itens_pedido(
		fk_pedido,
		fk_produto,
		nome_produto,
		empresa_vendedora,
		categoria,
		quantidade,
		preco_venda,
		subtotal
	)
	VALUES(
		@pedido,
		6,
		'Cadeira de Rodas Manual',
		'Mobility Brasil',
		'Mobilidade',
		10000,
		850.00,
		8500000.00
	);

	UPDATE produtos
	SET estoque_atual = estoque_atual - 10000
	WHERE id_produto = 6;

ROLLBACK;


/* O nível READ COMMITTED evita Dirty Reads (leituras de dados não confirmados),
impedindo que usuários visualizem informações que ainda podem sofrer rollback.

Esse nível de isolamento mantém um bom equilíbrio entre desempenho e consistência,
sendo adequado para um marketplace B2B como o Empr-E.

Exemplo:

Sem READ COMMITTED:

Transação A altera o estoque para 0.
Transação B lê estoque = 0.
Transação A executa ROLLBACK.
Estoque volta para 200.
Transação B trabalhou com uma informação incorreta.

Com READ COMMITTED:

Transação B somente visualiza dados após o COMMIT.
Assim, ela continua enxergando o estoque correto até que a alteração seja confirmada.

Consistência garantida.
*/