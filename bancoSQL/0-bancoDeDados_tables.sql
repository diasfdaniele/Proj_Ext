# Esquema e Scripts de Criação

DROP DATABASE IF EXISTS PJ_Extensao;
CREATE DATABASE PJ_Extensao;
USE PJ_Extensao;

CREATE TABLE empresas (
    id_empresa INT AUTO_INCREMENT PRIMARY KEY,
    firebase_uid VARCHAR(50) NOT NULL UNIQUE,
    cnpj VARCHAR(18) NOT NULL UNIQUE,
    perfil ENUM('vendedor','comprador') NOT NULL,
    tipo_usuario ENUM('vendedor','comprador') DEFAULT 'comprador',
    role VARCHAR(50) DEFAULT 'usuario-comum',
    telefone VARCHAR(20),
    email_acesso VARCHAR(100) NOT NULL UNIQUE,
    nome_responsavel VARCHAR(150),
    cpf_responsavel VARCHAR(14),
    cargo VARCHAR(100),
    razao_social VARCHAR(150) NOT NULL,
    categoria_empresa VARCHAR(50),
    tipo_empresa VARCHAR(50),
    descricao TEXT,
    site VARCHAR(255),    
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE enderecos (
    id_endereco INT AUTO_INCREMENT PRIMARY KEY,
    fk_empresa INT NOT NULL,
    cep VARCHAR(9) NOT NULL,
    logradouro VARCHAR(150) NOT NULL,
    numero VARCHAR(10),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(50) NOT NULL,
    estado CHAR(2) NOT NULL,
    tipo_endereco ENUM('Sede', 'Entrega', 'Faturamento') DEFAULT 'Sede',
    FOREIGN KEY (fk_empresa) REFERENCES empresas(id_empresa) ON DELETE CASCADE
);

CREATE TABLE contatos (
    id_contato INT AUTO_INCREMENT PRIMARY KEY,
    fk_empresa INT NOT NULL,
    tipo_contato ENUM('Telefone','Email','WhatsApp') NOT NULL,
    contato VARCHAR(100) NOT NULL,
    FOREIGN KEY (fk_empresa)
        REFERENCES empresas(id_empresa)
        ON DELETE CASCADE
);

CREATE TABLE categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nome_categoria VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE produtos (
    id_produto INT AUTO_INCREMENT PRIMARY KEY,
    product_code VARCHAR(100) UNIQUE,
    fk_vendedor INT NOT NULL,
    fk_categoria INT NOT NULL,
    nome_produto VARCHAR(150) NOT NULL,
    descricao TEXT,
    preco_unitario DECIMAL(12, 2) NOT NULL CHECK (preco_unitario > 0),
    estoque_minimo INT DEFAULT 0,
    estoque_atual INT NOT NULL DEFAULT 0,
    purchase_mode VARCHAR(50),
    ativo BOOLEAN DEFAULT TRUE,
    criado_em DATETIME,
    atualizado_em DATETIME,
    FOREIGN KEY (fk_vendedor) REFERENCES empresas(id_empresa),
    FOREIGN KEY (fk_categoria) REFERENCES categorias(id_categoria)
);

CREATE TABLE pedidos (
    id_pedido INT AUTO_INCREMENT PRIMARY KEY,
    fk_comprador INT NOT NULL,
    fk_endereco INT,
    metodo_pagamento VARCHAR(30),
    parcelamento VARCHAR(20),
    observacoes TEXT,
    status_pedido VARCHAR(30),
    total_estimado DECIMAL(10,2),
    possui_itens_sob_consulta BOOLEAN DEFAULT FALSE,
    referencia_pix VARCHAR(255),
    data_emissao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fk_comprador) REFERENCES empresas(id_empresa),
    FOREIGN KEY (fk_endereco) REFERENCES enderecos(id_endereco)
);

CREATE TABLE itens_pedido (
	id_item INT AUTO_INCREMENT PRIMARY KEY,
    fk_pedido INT NOT NULL,
    fk_produto INT NOT NULL,
    nome_produto VARCHAR(150),
    empresa_vendedora VARCHAR(150),
    categoria VARCHAR(50),
    quantidade INT NOT NULL CHECK (quantidade > 0),
    preco_venda DECIMAL(12, 2) NOT NULL, -- Snapshot do preço no momento da compra
    subtotal DECIMAL(10,2),
    FOREIGN KEY (fk_pedido) REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    FOREIGN KEY (fk_produto) REFERENCES produtos(id_produto)
);

CREATE TABLE favoritos (
    id_favorito INT AUTO_INCREMENT PRIMARY KEY,
    fk_empresa INT NOT NULL,
    fk_produto INT NOT NULL,
    criado_em DATETIME,
    FOREIGN KEY (fk_empresa) REFERENCES empresas(id_empresa) ON DELETE CASCADE,
    FOREIGN KEY (fk_produto) REFERENCES produtos(id_produto) ON DELETE CASCADE,
    UNIQUE(fk_empresa, fk_produto)
);
  