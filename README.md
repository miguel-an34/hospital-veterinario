# Sistema de Gestão para Hospital Veterinário - Banco de Dados

## Integrantes do Grupo
* Breno Viana Cavalcante
* Cauã Carvalho Modesto
* Miguel Antônio Barbosa Caetano
* William Torres Albuquerque

## Contexto do Projeto
Este projeto consiste na implementação física de um banco de dados relacional para um sistema de gestão de um Hospital Veterinário. O esquema lógico foi mapeado a partir de um Diagrama Conceitual (MERE) e estruturado para gerenciar dados de Usuários, Tutores, Funcionários, Veterinários, Animais, além das operações da clínica como Agendamentos, Consultas, Exames, Internações e Registros Clínicos.

## Ambiente de Execução e Credenciais
A aplicação completa (banco de dados, backend e frontend) foi disponibilizada para execução local via contêineres Docker. O repositório inclui um arquivo `docker-compose.yml`, na raiz do projeto, que configura e inicializa os três serviços automaticamente.

* **SGBD:** MySQL 8.0
* **Usuário:** admin
* **Senha:** adminpassword
* **Nome do Banco:** vet_hospital
* **Porta do Banco de Dados:** 3306
* **Porta do Backend (API):** 8080
* **Porta do Frontend:** 5173

### Como executar o projeto
1. Certifique-se de ter o Docker instalado e rodando em sua máquina.
2. Clone este repositório.
3. Na raiz do projeto, execute o comando:
```bash
   docker compose up -d
```
4. Após a inicialização, a aplicação estará acessível em `http://localhost:5173`.

## Esquema Lógico (Diagrama UML)
O diagrama lógico do banco de dados está disponível no arquivo [`Diagrama UML.pdf`](./Diagrama%20UML.pdf), anexado na raiz deste repositório.

## Dicionário de Dados
O dicionário de dados completo, com a descrição de todas as tabelas, atributos, tipos, restrições e semântica de cada campo, está disponível no arquivo [`Dicionário de Dados.pdf`](./Dicionário%20de%20Dados.pdf), anexado na raiz deste repositório.

## Metodologia de Povoamento

O banco foi povoado através de um script DML (`db/init-db/02-data.sql`), executado automaticamente pelo container na inicialização, logo após o `01-schema.sql`. O MySQL processa os arquivos de `docker-entrypoint-initdb.d/` em ordem alfabética na primeira vez que o volume é criado — por isso o script de dados foi nomeado com o prefixo `02-`, garantindo que rode depois do schema.

Os dados foram gerados por um script em **Python**, utilizando a biblioteca **Faker** (locale `pt_BR`) para produzir nomes, CPFs, endereços e telefones plausíveis, com cidades limitadas a municípios de Pernambuco. A geração respeitou a ordem de dependência das chaves estrangeiras (Usuario → Telefone/Tutor/Funcionario → Veterinario → Animal → Tutor_Animal/Alergia/Internacao → Agendamento → Consulta → RegistroClinico/Exame) e incluiu validações de integridade referencial antes da exportação do script SQL final.

O volume gerado ultrapassa os mínimos exigidos em todas as tabelas:

| Tabela | Linhas | Tipo |
|---|---|---|
| Usuario | 50 | Principal (mín. 50) |
| Animal | 50 | Principal (mín. 50) |
| Agendamento | 60 | Principal (mín. 50) |
| Consulta | 55 | Principal (mín. 50) |
| RegistroClinico | 50 | Principal (mín. 50) |
| Exame | 50 | Principal (mín. 50) |
| Telefone | 73 | Secundária (mín. 15) |
| Tutor | 24 | Secundária (mín. 15) |
| Funcionario | 26 | Secundária (mín. 15) |
| Veterinario | 16 | Secundária (mín. 15) |
| Tutor_Animal | 62 | Secundária (mín. 15) |
| Alergia | 20 | Secundária (mín. 15) |
| Internacao | 20 | Secundária (mín. 15) |

Para validar o povoamento em um ambiente limpo (removendo o volume existente e recriando o banco do zero):
```bash
docker compose down -v
docker compose up -d
```
## Documentação de Gatilhos (Triggers)

**Regra de Negócio Automatizada:**
O gatilho `trg_atualiza_status_consulta` automatiza o encerramento do fluxo de atendimento médico. Na regra de negócio da clínica, assim que o veterinário finaliza o atendimento e insere as anotações no prontuário do paciente (tabela `RegistroClinico`), a consulta correspondente não pode mais permanecer em aberto. O SGBD assume essa responsabilidade: ele intercepta a inserção do prontuário e atualiza automaticamente o campo `status` da tabela `Consulta` correspondente para "Concluída". Isso garante consistência nos dados sem depender de requisições extras do back-end.

**Como Testar:**
Para validar o funcionamento do gatilho, execute os comandos SQL abaixo em sequência:

1. Verifique o status atual de uma consulta que ainda não possui prontuário (ex: Consulta ID 35):
```sql
SELECT id_consulta, status FROM Consulta WHERE id_consulta = 35;
```
*(O resultado esperado no status é "Em andamento")*

2. Simule a ação do veterinário inserindo um novo registro clínico vinculado a esta consulta:
```sql
INSERT INTO RegistroClinico (descricao, data_registro, consulta_id) 
VALUES ('Avaliação clínica finalizada com sucesso.', CURRENT_DATE, 35);
```

3. Consulte a tabela de consultas novamente para verificar a automação:
```sql
SELECT id_consulta, status FROM Consulta WHERE id_consulta = 35;
```
*(O SGBD terá alterado automaticamente o status para "Concluída")*

## Correções Aplicadas em Relação à Devolutiva Anterior

A partir da revisão técnica recebida na entrega anterior, os seguintes pontos foram corrigidos no esquema do banco de dados:

- **Restrições de domínio ausentes:** adicionados `CHECK (salario >= 0)` em `Funcionario` e `CHECK (peso >= 0)` em `Animal`, impedindo valores negativos.
- **Duplicação em atributos multivalorados:** adicionadas as constraints `UNIQUE (usuario_cpf, numero)` em `Telefone` e `UNIQUE (animal_id, descricao)` em `Alergia`, impedindo duplicidade de telefones/alergias para o mesmo usuário/animal.
- **Integridade do prontuário médico:** as chaves estrangeiras que antes usavam `ON DELETE CASCADE` na cadeia `Animal → Consulta`, `Consulta → RegistroClinico`, `Consulta → Exame` e `Animal → Internacao` foram alteradas para `ON DELETE RESTRICT`, impedindo a exclusão acidental de um animal ou de uma consulta que já possua histórico clínico associado.
- **Valores arbitrários em `Consulta.status`:** o campo foi convertido de `VARCHAR(20)` livre para `ENUM('Agendada', 'Em andamento', 'Concluída', 'Cancelada')`, restringindo os valores possíveis.
- **Consistência temporal:** adicionados `CHECK (data_alta >= data_entrada)` em `Internacao` e `CHECK (data_resultado >= data_solicitacao)` em `Exame`.
- **Fragilidade da chave primária em `Internacao`:** o atributo `data_entrada` foi alterado de `DATE` para `DATETIME`, permitindo múltiplas internações do mesmo animal em datas iguais com horários distintos.
- **Ausência de timestamp em `Consulta`:** adicionado o campo `data_hora DATETIME DEFAULT CURRENT_TIMESTAMP`, registrando o momento exato do atendimento.

**Limitação conhecida:** a recomendação de complementar o `ON DELETE RESTRICT` com um mecanismo de exclusão lógica (soft delete, via flag `ativo`/`inativo`) não foi implementada nesta entrega, ficando como melhoria futura para o sistema.
