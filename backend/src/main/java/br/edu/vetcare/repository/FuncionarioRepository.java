package br.edu.vetcare.repository;

import java.sql.PreparedStatement;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import br.edu.vetcare.dto.funcionario.FuncionarioRequest;
import br.edu.vetcare.dto.funcionario.FuncionarioResponse;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class FuncionarioRepository {
    private static final String SELECT = """
            SELECT u.cpf, u.nome, u.email, u.data_cadastro, u.endereco_rua, u.endereco_numero,
                   u.endereco_bairro, u.endereco_cidade, u.endereco_cep,
                   GROUP_CONCAT(tel.numero ORDER BY tel.id_telefone SEPARATOR '||') AS telefones,
                   f.matricula, f.cargo, f.salario, f.data_admissao, v.crmv, v.especialidade
              FROM Funcionario f
              JOIN Usuario u ON u.cpf = f.cpf
              LEFT JOIN Telefone tel ON tel.usuario_cpf = u.cpf
              LEFT JOIN Veterinario v ON v.cpf = f.cpf
            """;

    private static final String GROUP = """
             GROUP BY u.cpf, u.nome, u.email, u.data_cadastro, u.endereco_rua, u.endereco_numero,
                      u.endereco_bairro, u.endereco_cidade, u.endereco_cep, f.matricula, f.cargo,
                      f.salario, f.data_admissao, v.crmv, v.especialidade
            """;

    private static final RowMapper<FuncionarioResponse> MAPPER = (rs, rowNum) -> new FuncionarioResponse(
            rs.getString("cpf"), rs.getString("nome"), rs.getString("email"),
            rs.getDate("data_cadastro").toLocalDate(), rs.getString("endereco_rua"),
            rs.getString("endereco_numero"), rs.getString("endereco_bairro"),
            rs.getString("endereco_cidade"), rs.getString("endereco_cep"),
            splitPhones(rs.getString("telefones")), rs.getString("matricula"),
            rs.getString("cargo"), rs.getBigDecimal("salario"),
            rs.getDate("data_admissao").toLocalDate(), rs.getString("crmv") != null,
            rs.getString("crmv"), rs.getString("especialidade"));

    private final JdbcClient jdbcClient;
    private final JdbcTemplate jdbcTemplate;

    public FuncionarioRepository(JdbcClient jdbcClient, JdbcTemplate jdbcTemplate) {
        this.jdbcClient = jdbcClient;
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<FuncionarioResponse> findAll() {
        return jdbcClient.sql(SELECT + GROUP + " ORDER BY u.nome").query(MAPPER).list();
    }

    public Optional<FuncionarioResponse> findByCpf(String cpf) {
        return jdbcClient.sql(SELECT + " WHERE f.cpf = :cpf" + GROUP)
                .param("cpf", cpf).query(MAPPER).optional();
    }

    public boolean existsUsuario(String cpf) {
        return jdbcClient.sql("SELECT COUNT(*) FROM Usuario WHERE cpf = :cpf")
                .param("cpf", cpf).query(Integer.class).single() > 0;
    }

    public boolean existsVeterinario(String cpf) {
        return jdbcClient.sql("SELECT COUNT(*) FROM Veterinario WHERE cpf = :cpf")
                .param("cpf", cpf).query(Integer.class).single() > 0;
    }

    public void insertUsuario(FuncionarioRequest request, String senhaHash) {
        jdbcClient.sql("""
                INSERT INTO Usuario
                    (cpf, nome, email, senha, data_cadastro, endereco_rua, endereco_numero,
                     endereco_bairro, endereco_cidade, endereco_cep)
                VALUES
                    (:cpf, :nome, :email, :senha, CURRENT_DATE, :rua, :numero, :bairro, :cidade, :cep)
                """)
                .param("cpf", request.cpf()).param("nome", request.nome().trim())
                .param("email", request.email().trim()).param("senha", senhaHash)
                .param("rua", request.enderecoRua().trim()).param("numero", request.enderecoNumero().trim())
                .param("bairro", request.enderecoBairro().trim()).param("cidade", request.enderecoCidade().trim())
                .param("cep", request.enderecoCep().trim()).update();
    }

    public void insertFuncionario(FuncionarioRequest request) {
        jdbcClient.sql("""
                INSERT INTO Funcionario (cpf, matricula, cargo, salario, data_admissao)
                VALUES (:cpf, :matricula, :cargo, :salario, :dataAdmissao)
                """)
                .param("cpf", request.cpf()).param("matricula", request.matricula().trim())
                .param("cargo", request.cargo().trim()).param("salario", request.salario())
                .param("dataAdmissao", request.dataAdmissao()).update();
    }

    public int updateUsuario(String cpf, FuncionarioRequest request, String senhaHash) {
        String senhaClause = senhaHash == null ? "" : ", senha = :senha";
        JdbcClient.StatementSpec statement = jdbcClient.sql("""
                UPDATE Usuario
                   SET nome = :nome, email = :email, endereco_rua = :rua,
                       endereco_numero = :numero, endereco_bairro = :bairro,
                       endereco_cidade = :cidade, endereco_cep = :cep
                """ + senhaClause + " WHERE cpf = :cpf")
                .param("nome", request.nome().trim()).param("email", request.email().trim())
                .param("rua", request.enderecoRua().trim()).param("numero", request.enderecoNumero().trim())
                .param("bairro", request.enderecoBairro().trim()).param("cidade", request.enderecoCidade().trim())
                .param("cep", request.enderecoCep().trim()).param("cpf", cpf);
        if (senhaHash != null) statement = statement.param("senha", senhaHash);
        return statement.update();
    }

    public int updateFuncionario(String cpf, FuncionarioRequest request) {
        return jdbcClient.sql("""
                UPDATE Funcionario
                   SET matricula = :matricula, cargo = :cargo, salario = :salario,
                       data_admissao = :dataAdmissao
                 WHERE cpf = :cpf
                """)
                .param("matricula", request.matricula().trim()).param("cargo", request.cargo().trim())
                .param("salario", request.salario()).param("dataAdmissao", request.dataAdmissao())
                .param("cpf", cpf).update();
    }

    public void insertVeterinario(String cpf, FuncionarioRequest request) {
        jdbcClient.sql("""
                INSERT INTO Veterinario (cpf, crmv, especialidade)
                VALUES (:cpf, :crmv, :especialidade)
                """)
                .param("cpf", cpf).param("crmv", request.crmv().trim())
                .param("especialidade", nullableTrim(request.especialidade())).update();
    }

    public void updateVeterinario(String cpf, FuncionarioRequest request) {
        jdbcClient.sql("""
                UPDATE Veterinario SET crmv = :crmv, especialidade = :especialidade WHERE cpf = :cpf
                """)
                .param("crmv", request.crmv().trim())
                .param("especialidade", nullableTrim(request.especialidade()))
                .param("cpf", cpf).update();
    }

    public void deleteVeterinario(String cpf) {
        jdbcClient.sql("DELETE FROM Veterinario WHERE cpf = :cpf").param("cpf", cpf).update();
    }

    public void replacePhones(String cpf, List<String> phones) {
        jdbcClient.sql("DELETE FROM Telefone WHERE usuario_cpf = :cpf").param("cpf", cpf).update();
        if (phones == null || phones.isEmpty()) return;
        List<String> validPhones = phones.stream().filter(phone -> phone != null && !phone.isBlank()).toList();
        if (validPhones.isEmpty()) return;
        jdbcTemplate.batchUpdate("INSERT INTO Telefone (usuario_cpf, numero) VALUES (?, ?)", validPhones,
                validPhones.size(), (PreparedStatement ps, String phone) -> {
                    ps.setString(1, cpf);
                    ps.setString(2, phone.trim());
                });
    }

    public int deleteUsuario(String cpf) {
        return jdbcClient.sql("DELETE FROM Usuario WHERE cpf = :cpf").param("cpf", cpf).update();
    }

    private static String nullableTrim(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private static List<String> splitPhones(String phones) {
        return phones == null || phones.isBlank() ? List.of() : Arrays.asList(phones.split("\\|\\|"));
    }
}
