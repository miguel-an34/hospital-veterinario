# Dicionário de Dados

**Curso:** BCC | UFAPE

**Docente:** Prof.ª Dra. Priscilla Kelly Machado Azevedo

## Integrantes do Grupo

1. Breno Viana Cavalcante
2. Cauã Carvalho Modesto
3. Miguel Antônio Barbosa Caetano
4. William Torres Albuquerque

## 1. Dicionário de Dados

A seguir, é apresentado o dicionário de dados detalhado. Cada subseção descreve a finalidade da tabela, seguida pela especificação técnica de seus atributos, tipos de dados, restrições de integridade e semântica.

### 1.1 Tabela: Usuario

**Descrição da tabela:** Tabela pai que centraliza os dados pessoais, as credenciais de acesso e o endereço dos usuários do sistema. É especializada pelas entidades Tutor e Funcionario.

| Atributo | Tipo | Restrições | Semântica/Descrição |
|---|---|---|---|
| cpf | VARCHAR(11) | PK, Not Null | Cadastro de Pessoa Física do usuário, contendo apenas números. Identifica o usuário univocamente. |
| nome | VARCHAR(100) | Not Null | Nome completo do usuário. |
| email | VARCHAR(100) | Unique, Not Null | Endereço de e-mail utilizado para contato e acesso. Não admite duplicatas. |
| senha | VARCHAR(255) | Not Null | Hash da senha utilizada para autenticação. |
| data_cadastro | DATE | Default Current Date, Not Null | Data em que o usuário foi cadastrado. |
| endereco_rua | VARCHAR(100) | Not Null | Nome da rua, avenida ou outro logradouro. |
| endereco_numero | VARCHAR(10) | Not Null | Número do imóvel. O tipo textual admite valores alfanuméricos e indicações como S/N. |
| endereco_bairro | VARCHAR(60) | Not Null | Bairro onde o usuário reside. |
| endereco_cidade | VARCHAR(60) | Not Null | Cidade onde o usuário reside. |
| endereco_cep | VARCHAR(10) | Not Null | Código de Endereçamento Postal, preservando zeros à esquerda e caracteres de formatação. |

### 1.2 Tabela: Tutor

**Descrição da tabela:** Especialização de Usuario. Identifica os usuários que exercem o papel de tutores e podem ser responsáveis pelos animais cadastrados.

| Atributo | Tipo | Restrições | Semântica/Descrição |
|---|---|---|---|
| cpf | VARCHAR(11) | PK, FK, Not Null | Referencia Usuario.cpf. Garante a relação 1:1 da especialização e identifica o tutor univocamente. |

### 1.3 Tabela: Funcionario

**Descrição da tabela:** Especialização de Usuario. Armazena os dados profissionais dos usuários que trabalham no hospital veterinário.

| Atributo | Tipo | Restrições | Semântica/Descrição |
|---|---|---|---|
| cpf | VARCHAR(11) | PK, FK, Not Null | Referencia Usuario.cpf. Garante a relação 1:1 da especialização e identifica o funcionário. |
| matricula | VARCHAR(20) | Unique, Not Null | Código de matrícula funcional. Não admite duplicatas. |
| cargo | VARCHAR(50) | Not Null | Nome do cargo exercido pelo funcionário. |
| salario | DECIMAL(10,2) | Not Null | Valor monetário do salário, com duas casas decimais. |
| data_admissao | DATE | Not Null | Data em que o funcionário foi admitido. |

### 1.4 Tabela: Veterinario

**Descrição da tabela:** Especialização de Funcionario. Armazena informações dos profissionais habilitados a atuar como médicos-veterinários.

| Atributo | Tipo | Restrições | Semântica/Descrição |
|---|---|---|---|
| cpf | VARCHAR(11) | PK, FK, Not Null | Referencia Funcionario.cpf. Garante a relação 1:1 da especialização. |
| crmv | VARCHAR(20) | Unique, Not Null | Número de inscrição no Conselho Regional de Medicina Veterinária. |
| especialidade | VARCHAR(60) | Null | Área principal de especialização ou atuação. |

### 1.5 Tabela: Telefone

**Descrição da tabela:** Armazena os contatos telefônicos dos usuários, permitindo múltiplos números por usuário.

| Atributo | Tipo | Restrições | Semântica/Descrição |
|---|---|---|---|
| id_telefone | INT | PK, AI, Not Null | Identificador único e sequencial do telefone. |
| usuario_cpf | VARCHAR(11) | FK, Not Null | Referencia Usuario.cpf e identifica o dono do número. |
| numero | VARCHAR(20) | Not Null | Número com possível DDD, código do país e caracteres de formatação. |

### 1.6 Tabela: Animal

**Descrição da tabela:** Armazena os dados cadastrais e as características biológicas dos animais atendidos pelo hospital.

| Atributo | Tipo | Restrições | Semântica/Descrição |
|---|---|---|---|
| id_animal | INT | PK, AI, Not Null | Identificador único e sequencial do animal. |
| nome | VARCHAR(60) | Not Null | Nome pelo qual o animal é identificado. |
| especie | VARCHAR(40) | Not Null | Espécie do animal, como canina, felina ou aviária. |
| raca | VARCHAR(40) | Null | Raça do animal; pode não ser informada. |
| sexo | CHAR(1) | Not Null, Check M/F | Sexo representado por M para macho ou F para fêmea. |
| peso | DECIMAL(5,2) | Null | Peso atual em quilogramas. |
| data_nascimento | DATE | Null | Data de nascimento utilizada para calcular a idade. |
| /idade | INT | Derivado | Idade calculada a partir de data_nascimento e da data atual; não é armazenada fisicamente. |

### 1.7 Tabela: Tutor_Animal

**Descrição da tabela:** Tabela associativa que implementa o relacionamento N:N entre Tutor e Animal.

| Atributo | Tipo | Restrições | Semântica/Descrição |
|---|---|---|---|
| tutor_cpf | VARCHAR(11) | PK, FK, Not Null | Parte da chave composta. Referencia Tutor.cpf. |
| animal_id | INT | PK, FK, Not Null | Parte da chave composta. Referencia Animal.id_animal. |

### 1.8 Tabela: Agendamento

**Descrição da tabela:** Gerencia os agendamentos de atendimento, registrando data, horário, motivo, tutor e animal.

| Atributo | Tipo | Restrições | Semântica/Descrição |
|---|---|---|---|
| id_agendamento | INT | PK, AI, Not Null | Identificador único e sequencial do agendamento. |
| data | DATE | Not Null | Data prevista para o atendimento. |
| horario | TIME | Not Null | Horário previsto para o atendimento. |
| motivo | VARCHAR(200) | Not Null | Motivo informado para solicitar o atendimento. |
| tutor_cpf | VARCHAR(11) | FK, Not Null | Referencia Tutor.cpf e identifica o tutor responsável. |
| animal_id | INT | FK, Not Null | Referencia Animal.id_animal e identifica o animal. |

### 1.9 Tabela: Consulta

**Descrição da tabela:** Armazena os atendimentos clínicos realizados pelos veterinários. Cada consulta pertence a um animal, registra seu instante de realização e pode estar vinculada a um agendamento.

| Atributo | Tipo | Restrições | Semântica/Descrição |
|---|---|---|---|
| id_consulta | INT | PK, AI, Not Null | Identificador único e sequencial da consulta. |
| data_hora | DATETIME | Default Current Timestamp, Not Null | Data e horário da consulta. Permite registrar com precisão atendimentos agendados e de urgência. |
| observacoes | TEXT | Null | Anotações gerais feitas durante o atendimento. |
| status | VARCHAR(20) | Default 'Agendada', Not Null | Situação atual: Agendada, Em andamento, Concluída ou Cancelada. |
| animal_id | INT | FK, Not Null | Referencia Animal.id_animal e identifica o animal atendido. |
| veterinario_cpf | VARCHAR(11) | FK, Not Null | Referencia Veterinario.cpf e identifica o profissional responsável. |
| agendamento_id | INT | FK, Unique, Null | Referência opcional a Agendamento.id_agendamento. Unique garante que cada agendamento origine no máximo uma consulta. |

### 1.10 Tabela: RegistroClinico

**Descrição da tabela:** Armazena anotações vinculadas a uma consulta, formando o histórico de ocorrências, diagnósticos, evoluções e procedimentos.

| Atributo | Tipo | Restrições | Semântica/Descrição |
|---|---|---|---|
| id_registro | INT | PK, AI, Not Null | Identificador único e sequencial do registro clínico. |
| descricao | TEXT | Not Null | Descrição da ocorrência, diagnóstico, evolução ou procedimento. |
| data_registro | DATE | Default Current Date, Not Null | Data em que a anotação foi registrada. |
| consulta_id | INT | FK, Not Null | Referencia Consulta.id_consulta. |

### 1.11 Tabela: Exame

**Descrição da tabela:** Registra os exames solicitados no contexto de uma consulta, incluindo tipo, datas, observações e resultado.

| Atributo | Tipo | Restrições | Semântica/Descrição |
|---|---|---|---|
| id_exame | INT | PK, AI, Not Null | Identificador único e sequencial do exame. |
| tipo | VARCHAR(60) | Not Null | Nome ou categoria do exame solicitado. |
| resultado | VARCHAR(200) | Null | Resumo do resultado; pode permanecer vazio enquanto pendente. |
| observacoes | TEXT | Null | Informações complementares sobre solicitação, execução ou resultado. |
| data_solicitacao | DATE | Default Current Date, Not Null | Data em que o exame foi solicitado. |
| data_resultado | DATE | Null | Data de disponibilização do resultado. |
| consulta_id | INT | FK, Not Null | Referencia Consulta.id_consulta. |

### 1.12 Tabela: Alergia

**Descrição da tabela:** Mantém o histórico de alergias conhecidas dos animais para apoiar decisões clínicas seguras.

| Atributo | Tipo | Restrições | Semântica/Descrição |
|---|---|---|---|
| id_alergia | INT | PK, AI, Not Null | Identificador único e sequencial do registro de alergia. |
| animal_id | INT | FK, Not Null | Referencia Animal.id_animal. |
| descricao | VARCHAR(100) | Not Null | Substância, medicamento, alimento ou outro agente causador. |

### 1.13 Tabela: Internacao

**Descrição da tabela:** Registra cada ocorrência de internação com identidade própria, incluindo os instantes de entrada e alta, leito e observações. Um animal pode receber alta e ser internado novamente no mesmo dia.

| Atributo | Tipo | Restrições | Semântica/Descrição |
|---|---|---|---|
| id_internacao | INT | PK, AI, Not Null | Chave substituta que identifica cada ocorrência de internação univocamente. |
| animal_id | INT | FK, Not Null, Indexed | Referencia Animal.id_animal. Compõe com data_entrada um índice para consultas do histórico do animal. |
| data_entrada | DATETIME | Not Null | Data e horário exatos da entrada do animal. |
| data_alta | DATETIME | Null, Check >= data_entrada | Data e horário da alta. Permanece vazia enquanto a internação estiver ativa. |
| leito | VARCHAR(20) | Not Null | Código ou identificação do leito ocupado. |
| observacoes | TEXT | Null | Informações complementares sobre o período de internação. |

### Legenda

- **PK:** chave primária.
- **FK:** chave estrangeira.
- **AI:** incremento automático.
- **Unique:** valor único na tabela.
- **Not Null:** preenchimento obrigatório.
- **Null:** preenchimento opcional.
- **Check:** restrição de validação aplicada pelo banco.
- **Indexed:** atributo participante de índice auxiliar.
