SET NAMES utf8mb4;

-- 01-schema.sql

-- Tabela Usuário
CREATE TABLE Usuario (
    cpf VARCHAR(11) PRIMARY KEY NOT NULL,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    data_cadastro DATE DEFAULT (CURRENT_DATE) NOT NULL,
    endereco_rua VARCHAR(100) NOT NULL,
    endereco_numero VARCHAR(10) NOT NULL,
    endereco_bairro VARCHAR(60) NOT NULL,
    endereco_cidade VARCHAR(60) NOT NULL,
    endereco_cep VARCHAR(10) NOT NULL
);

-- Tabela Tutor
CREATE TABLE Tutor (
    cpf VARCHAR(11) PRIMARY KEY NOT NULL,
    FOREIGN KEY (cpf) REFERENCES Usuario(cpf) ON DELETE CASCADE
);

-- Tabela Funcionario
CREATE TABLE Funcionario (
    cpf VARCHAR(11) PRIMARY KEY NOT NULL,
    matricula VARCHAR(20) UNIQUE NOT NULL,
    cargo VARCHAR(50) NOT NULL,
    salario DECIMAL(10,2) NOT NULL,
    data_admissao DATE NOT NULL,
    FOREIGN KEY (cpf) REFERENCES Usuario(cpf) ON DELETE CASCADE
);

-- Tabela Veterinario
CREATE TABLE Veterinario (
    cpf VARCHAR(11) PRIMARY KEY NOT NULL,
    crmv VARCHAR(20) UNIQUE NOT NULL,
    especialidade VARCHAR(60),
    FOREIGN KEY (cpf) REFERENCES Funcionario(cpf) ON DELETE CASCADE
);

-- Tabela Telefone
CREATE TABLE Telefone (
    id_telefone INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    usuario_cpf VARCHAR(11) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    FOREIGN KEY (usuario_cpf) REFERENCES Usuario(cpf) ON DELETE CASCADE
);

-- Tabela Animal
CREATE TABLE Animal (
    id_animal INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    nome VARCHAR(60) NOT NULL,
    especie VARCHAR(40) NOT NULL,
    raca VARCHAR(40),
    sexo CHAR(1) NOT NULL CHECK (sexo IN ('M', 'F')),
    peso DECIMAL(5,2),
    data_nascimento DATE
);

-- Tabela Tutor_Animal
CREATE TABLE Tutor_Animal (
    tutor_cpf VARCHAR(11) NOT NULL,
    animal_id INT NOT NULL,
    PRIMARY KEY (tutor_cpf, animal_id),
    FOREIGN KEY (tutor_cpf) REFERENCES Tutor(cpf) ON DELETE CASCADE,
    FOREIGN KEY (animal_id) REFERENCES Animal(id_animal) ON DELETE CASCADE
);

-- Tabela Agendamento
CREATE TABLE Agendamento (
    id_agendamento INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    data DATE NOT NULL,
    horario TIME NOT NULL,
    motivo VARCHAR(200) NOT NULL,
    tutor_cpf VARCHAR(11) NOT NULL,
    animal_id INT NOT NULL,
    FOREIGN KEY (tutor_cpf) REFERENCES Tutor(cpf) ON DELETE CASCADE,
    FOREIGN KEY (animal_id) REFERENCES Animal(id_animal) ON DELETE CASCADE
);

-- Tabela Consulta
CREATE TABLE Consulta (
    id_consulta INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    observacoes TEXT,
    status VARCHAR(20) DEFAULT 'Agendada' NOT NULL,
    animal_id INT NOT NULL,
    veterinario_cpf VARCHAR(11) NOT NULL,
    agendamento_id INT UNIQUE NULL,
    FOREIGN KEY (animal_id) REFERENCES Animal(id_animal) ON DELETE CASCADE,
    FOREIGN KEY (veterinario_cpf) REFERENCES Veterinario(cpf) ON DELETE RESTRICT,
    FOREIGN KEY (agendamento_id) REFERENCES Agendamento(id_agendamento) ON DELETE SET NULL
);

-- Tabela RegistroClinico
CREATE TABLE RegistroClinico (
    id_registro INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    descricao TEXT NOT NULL,
    data_registro DATE DEFAULT (CURRENT_DATE) NOT NULL,
    consulta_id INT NOT NULL,
    FOREIGN KEY (consulta_id) REFERENCES Consulta(id_consulta) ON DELETE CASCADE
);

-- Tabela Exame
CREATE TABLE Exame (
    id_exame INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    tipo VARCHAR(60) NOT NULL,
    resultado VARCHAR(200),
    observacoes TEXT,
    data_solicitacao DATE DEFAULT (CURRENT_DATE) NOT NULL,
    data_resultado DATE,
    consulta_id INT NOT NULL,
    FOREIGN KEY (consulta_id) REFERENCES Consulta(id_consulta) ON DELETE CASCADE
);

-- Tabela Alergia
CREATE TABLE Alergia (
    id_alergia INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    animal_id INT NOT NULL,
    descricao VARCHAR(100) NOT NULL,
    FOREIGN KEY (animal_id) REFERENCES Animal(id_animal) ON DELETE CASCADE
);

-- Tabela Internacao
CREATE TABLE Internacao (
    animal_id INT NOT NULL,
    data_entrada DATE NOT NULL,
    data_alta DATE,
    leito VARCHAR(20) NOT NULL,
    observacoes TEXT,
    PRIMARY KEY (animal_id, data_entrada),
    FOREIGN KEY (animal_id) REFERENCES Animal(id_animal) ON DELETE CASCADE
);
