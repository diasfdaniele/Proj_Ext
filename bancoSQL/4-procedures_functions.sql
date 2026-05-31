#Procedures e Funções

#Cadastrar um novo produto validando se a empresa vendedora existe e está ativa.
DELIMITER //
CREATE PROCEDURE sp_cadastrar_produto(
    IN p_vendedor INT,
    IN p_categoria INT,
    IN p_nome VARCHAR(100),
    IN p_preco DECIMAL(12,2),
    IN p_estoque INT
)
BEGIN
    DECLARE v_status VARCHAR(30);
    START TRANSACTION;
    SELECT status_conta
    INTO v_status
    FROM empresas
    WHERE id_empresa = p_vendedor;
    IF v_status IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Empresa não encontrada';
    END IF;
    IF v_status <> 'Ativo' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Empresa não está ativa';
    END IF;
    INSERT INTO produtos(fk_vendedor, fk_categoria, nome_produto, preco_unitario, estoque_atual)
    VALUES(p_vendedor, p_categoria, p_nome, p_preco, p_estoque);
    COMMIT;
END //
DELIMITER ;


#Calcular o valor total de um pedido.
DELIMITER //
CREATE FUNCTION fn_total_pedido (p_id_pedido INT)
RETURNS DECIMAL(12,2)
DETERMINISTIC
BEGIN
    DECLARE v_total DECIMAL(12,2);
    SELECT SUM(quantidade * preco_venda)
    INTO v_total
    FROM itens_pedido
    WHERE fk_pedido = p_id_pedido;
    RETURN IFNULL(v_total,0);
END //
DELIMITER ;


#Gerar relatório de faturamento por empresa usando tabela temporária.
DELIMITER //
CREATE PROCEDURE sp_relatorio_faturamento()
BEGIN
    DROP TEMPORARY TABLE IF EXISTS tmp_faturamento;
    CREATE TEMPORARY TABLE tmp_faturamento(
        empresa VARCHAR(150),
        faturamento DECIMAL(12,2)
    );
    INSERT INTO tmp_faturamento
    SELECT e.nome_fantasia, SUM(ip.quantidade * ip.preco_venda) FROM empresas e
    INNER JOIN produtos p ON e.id_empresa = p.fk_vendedor
    INNER JOIN itens_pedido ip ON p.id_produto = ip.fk_produto
    GROUP BY e.id_empresa;
    SELECT * FROM tmp_faturamento ORDER BY faturamento DESC;
END //
DELIMITER ;


#Garantir que um pedido só possa ser marcado como pago se possuir itens.
DELIMITER //
CREATE PROCEDURE sp_pagar_pedido(
    IN p_pedido INT
)
BEGIN
    DECLARE v_qtd INT;
    SELECT COUNT(*) INTO v_qtd FROM itens_pedido
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


