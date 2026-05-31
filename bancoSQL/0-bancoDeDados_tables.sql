# Esquema e Scripts de Criação

DROP DATABASE IF EXISTS PJ_Extensao;
CREATE DATABASE PJ_Extensao;
USE PJ_Extensao;

CREATE TABLE empresas (
    id_empresa INT AUTO_INCREMENT PRIMARY KEY,
    cnpj CHAR(14) NOT NULL UNIQUE,
    razao_social VARCHAR(150) NOT NULL,
    nome_fantasia VARCHAR(150) NOT NULL,
    inscricao_estadual VARCHAR(20) UNIQUE,
    email_acesso VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    status_conta ENUM('Ativo', 'Bloqueado', 'Aguardando Aprovação') DEFAULT 'Aguardando Aprovação',
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_cnpj_len CHECK (LENGTH(cnpj) = 14) #verifica se o cnpj está no tamanho conforme normas
);

CREATE TABLE enderecos (
    id_endereco INT AUTO_INCREMENT PRIMARY KEY,
    fk_empresa INT NOT NULL,
    logradouro VARCHAR(150) NOT NULL,
    numero VARCHAR(10),
    bairro VARCHAR(50),
    cidade VARCHAR(50) NOT NULL,
    estado CHAR(2) NOT NULL,
    cep CHAR(8) NOT NULL,
    tipo_endereco ENUM('Sede', 'Entrega', 'Faturamento') DEFAULT 'Sede',
    FOREIGN KEY (fk_empresa) REFERENCES empresas(id_empresa) ON DELETE CASCADE
);

CREATE TABLE contatos (
    id_contato INT AUTO_INCREMENT PRIMARY KEY,
    fk_empresa INT NOT NULL,
    contato VARCHAR(100) NOT NULL,
    FOREIGN KEY (fk_empresa) REFERENCES empresas(id_empresa) ON DELETE CASCADE
);

CREATE TABLE categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nome_categoria VARCHAR(50) NOT NULL UNIQUE,
    setor_mercado VARCHAR(50) -- Ex: 'Eletrônicos', 'Matéria-prima'
);

CREATE TABLE produtos (
    id_produto INT AUTO_INCREMENT PRIMARY KEY,
    fk_vendedor INT NOT NULL,
    fk_categoria INT NOT NULL,
    nome_produto VARCHAR(100) NOT NULL,
    preco_unitario DECIMAL(12, 2) NOT NULL CHECK (preco_unitario > 0),
    estoque_minimo INT DEFAULT 0,
    estoque_atual INT NOT NULL DEFAULT 0,
    FOREIGN KEY (fk_vendedor) REFERENCES empresas(id_empresa),
    FOREIGN KEY (fk_categoria) REFERENCES categorias(id_categoria)
);

CREATE TABLE pedidos (
    id_pedido INT AUTO_INCREMENT PRIMARY KEY,
    fk_comprador INT NOT NULL,
    data_emissao DATETIME DEFAULT CURRENT_TIMESTAMP,
    status_pedido ENUM('Aberto', 'Pago', 'Cancelado', 'Enviado') DEFAULT 'Aberto',
    FOREIGN KEY (fk_comprador) REFERENCES empresas(id_empresa)
);

CREATE TABLE itens_pedido (
    fk_pedido INT NOT NULL,
    fk_produto INT NOT NULL,
    quantidade INT NOT NULL CHECK (quantidade > 0),
    preco_venda DECIMAL(12, 2) NOT NULL, -- Snapshot do preço no momento da compra
    PRIMARY KEY (fk_pedido, fk_produto),
    FOREIGN KEY (fk_pedido) REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    FOREIGN KEY (fk_produto) REFERENCES produtos(id_produto)
);