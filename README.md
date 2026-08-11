# Sistema de Gestão para Hospital Veterinário - Banco de Dados

## Integrantes do Grupo
* Breno Viana Cavalcante
* Cauã Carvalho Modesto
* Miguel Antônio Barbosa Caetano
* William Torres Albuquerque

## Contexto do Projeto
Este projeto consiste na implementação física de um banco de dados relacional para um sistema de gestão de um Hospital Veterinário. O esquema lógico foi mapeado a partir de um Diagrama Conceitual (MERE) e estruturado para gerenciar dados de Usuários, Tutores, Funcionários, Veterinários, Animais, além das operações da clínica como Agendamentos, Consultas, Exames, Internações e Registros Clínicos.

## Ambiente de Execução e Credenciais
O banco de dados foi disponibilizado para execução local via contêiner Docker. O repositório inclui um arquivo `docker-compose.yml` que configura e inicializa o serviço automaticamente.

* **SGBD:** MySQL 8.0
* **Usuário:** admin
* **Senha:** adminpassword
* **Nome do Banco:** vet_hospital
* **Porta:** 3306

### Como executar o projeto
1. Certifique-se de ter o Docker Desktop instalado e rodando em sua máquina.
2. Clone este repositório.
3. Na raiz do projeto, execute o comando:
   ```bash
   docker-compose up -d
