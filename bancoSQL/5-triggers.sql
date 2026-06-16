#Triggers

#1 - Log
CREATE TABLE log_produtos (
    id_log INT AUTO_INCREMENT PRIMARY KEY,
    id_produto INT,
    nome_produto VARCHAR(150),
    preco_antigo DECIMAL(12,2),
    preco_novo DECIMAL(12,2),
    data_alteracao DATETIME DEFAULT CURRENT_TIMESTAMP
);

#2 INTEGRIDADE - Impedir exclusão de produtos com histórico de pedidos
DELIMITER //
CREATE TRIGGER trg_bloquear_exclusao_produto
BEFORE DELETE ON produtos
FOR EACH ROW
BEGIN
    IF EXISTS
    (
        SELECT 1
        FROM itens_pedido
        WHERE fk_produto = OLD.id_produto
    )
    THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT =
        'Produto possui histórico de vendas.';
    END IF;
END //
DELIMITER ;

#3 AUDITORIA - Registra alterações de preço na tabela LOG
DELIMITER //
CREATE TRIGGER trg_log_preco_produto
AFTER UPDATE ON produtos
FOR EACH ROW
BEGIN
    IF OLD.preco_unitario <> NEW.preco_unitario THEN
        INSERT INTO log_produtos
        (
            id_produto,
            nome_produto,
            preco_antigo,
            preco_novo
        )
        VALUES
        (
            NEW.id_produto,
            NEW.nome_produto,
            OLD.preco_unitario,
            NEW.preco_unitario
        );
    END IF;
END //
DELIMITER ;

#4 - Impedir estoque negativo
DELIMITER //
CREATE TRIGGER trg_validar_estoque
BEFORE UPDATE ON produtos
FOR EACH ROW
BEGIN
    IF NEW.estoque_atual < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT =
        'O estoque não pode ficar negativo.';
    END IF;
END //
DELIMITER ;
