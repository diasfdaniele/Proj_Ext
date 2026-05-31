#Transações

#Venda de produto com atualização automática do estoque.
START TRANSACTION;
	INSERT INTO pedidos(fk_comprador, status_pedido)
	VALUES(2, 'Aberto');
	SET @pedido = LAST_INSERT_ID();
	INSERT INTO itens_pedido(fk_pedido, fk_produto, quantidade, preco_venda)
	VALUES(@pedido, 1, 10, 25.50);
	UPDATE produtos
	SET estoque_atual = estoque_atual - 10
	WHERE id_produto = 1;
COMMIT;

#Caso o estoque seja menor do que a quantidade solicitada
START TRANSACTION;
	INSERT INTO pedidos(fk_comprador,status_pedido)
	VALUES(2,'Aberto');
	SET @pedido = LAST_INSERT_ID();
	INSERT INTO itens_pedido(fk_pedido, fk_produto, quantidade, preco_venda)
	VALUES(@pedido, 1, 10000, 25.50);
	UPDATE produtos
	SET estoque_atual = estoque_atual - 10000
	WHERE id_produto = 1;
ROLLBACK;
/*O nível READ COMMITTED evita: Dirty Reads (leituras de dados não confirmados) e 
Usuários visualizando informações que podem sofrer rollback. Então ele mantém bom desempenho para um 
marketplace B2B como o projeto.

Exemplo:
Sem READ COMMITTED:
Transação A altera estoque para 0.
Transação B lê estoque = 0.
Transação A executa ROLLBACK.
Estoque volta para 200.
Transação B trabalhou com informação incorreta.

Com READ COMMITTED:
Transação B só enxerga dados após COMMIT.
Consistência garantida.*/