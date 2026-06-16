#Procedures e Funções

#PROCEDURE 1 - CRUD de produto com validação
DELIMITER //
CREATE PROCEDURE sp_cadastrar_produto(
    IN p_vendedor INT,
    IN p_categoria INT,
    IN p_nome VARCHAR(150),
    IN p_preco DECIMAL(12,2),
    IN p_estoque INT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Erro ao cadastrar produto.';
    END;
    START TRANSACTION;
    IF NOT EXISTS (
        SELECT 1
        FROM empresas
        WHERE id_empresa = p_vendedor
        AND perfil = 'Vendedor'
    )
    THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Empresa não é vendedora.';
    END IF;
    INSERT INTO produtos (
        fk_vendedor,
        fk_categoria,
        nome_produto,
        preco_unitario,
        estoque_atual
    )
    VALUES (
        p_vendedor,
        p_categoria,
        p_nome,
        p_preco,
        p_estoque
    );
    COMMIT;
END //
DELIMITER ;
/*Pré-condições:
Empresa deve existir.
Empresa deve possuir perfil "Vendedor".
Categoria deve existir.
Pós-condições:
Produto inserido na tabela produtos.
Transação confirmada com COMMIT.*/

#PROCEDURE 2 - Relatório de faturamento por empresa usando tabela temporária
DELIMITER //
CREATE PROCEDURE sp_relatorio_faturamento()
BEGIN
    DROP TEMPORARY TABLE IF EXISTS tmp_faturamento;
    CREATE TEMPORARY TABLE tmp_faturamento AS
    SELECT
        e.razao_social,
        SUM(ip.subtotal) AS faturamento
    FROM empresas e
    INNER JOIN produtos p
        ON e.id_empresa = p.fk_vendedor
    INNER JOIN itens_pedido ip
        ON p.id_produto = ip.fk_produto
    GROUP BY e.id_empresa;
    SELECT *
    FROM tmp_faturamento
    ORDER BY faturamento DESC;
END //
DELIMITER ;
/*Pré-condições:
Existirem pedidos registrados.
Existirem itens de pedido.
Pós-condições:
Tabela temporária criada.
Relatório retornado ordenado por faturamento.*/

#PROCEDURE 3 - Garante que um pedido só possa ser marcado como pago se possuir itens
DELIMITER //
CREATE PROCEDURE sp_pagar_pedido(
    IN p_pedido INT
)
BEGIN
    DECLARE v_qtd INT;
    SELECT COUNT(*)
    INTO v_qtd
    FROM itens_pedido
    WHERE fk_pedido = p_pedido;

    IF v_qtd = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Pedido sem itens';
    END IF;

    UPDATE pedidos
    SET status_pedido = 'Pago'
    WHERE id_pedido = p_pedido;
END //
DELIMITER ;
/*Pré-condições:
Pedido deve existir.
Pedido deve possuir pelo menos um item.
Pós-condições:
Status alterado para "Pago".*/


#FUNÇÃO 1 - Calcula o valor total de um pedido
DELIMITER //
CREATE FUNCTION fn_total_pedido(
    p_id_pedido INT
)
RETURNS DECIMAL(12,2)
DETERMINISTIC
BEGIN
    DECLARE v_total DECIMAL(12,2);
    SELECT SUM(subtotal)
    INTO v_total
    FROM itens_pedido
    WHERE fk_pedido = p_id_pedido;
    RETURN IFNULL(v_total,0);
END //
DELIMITER ;
/*Pré-condições
Pedido deve existir.
Pós-condições
Retorna valor total do pedido.*/