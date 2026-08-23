package br.edu.vetcare.repository;

import java.sql.PreparedStatement;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import br.edu.vetcare.dto.tutor.TutorRequest;
import br.edu.vetcare.dto.tutor.TutorResponse;
import br.edu.vetcare.dto.tutor.TutorSummary;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class TutorRepository {
    private static final String SELECT_DETAIL = """
            SELECT u.cpf, u.nome, u.email, u.data_cadastro, u.endereco_rua, u.endereco_numero,
                   u.endereco_bairro, u.endereco_cidade, u.endereco_cep,
                   GROUP_CONCAT(tel.numero ORDER BY tel.id_telefone SEPARATOR '||') AS telefones
              FROM Tutor t
              JOIN Usuario u ON u.cpf = t.cpf
              LEFT JOIN Telefone tel ON tel.usuario_cpf = u.cpf
            """;

    private static final String GROUP_BY = """
             GROUP BY u.cpf, u.nome, u.email, u.data_cadastro, u.endereco_rua, u.endereco_numero,
                      u.endereco_bairro, u.endereco_cidade, u.endereco_cep
            """;

    private static final RowMapper<TutorResponse> DETAIL_MAPPER = (rs, rowNum) -> new TutorResponse(
            rs.getString("cpf"), rs.getString("nome"), rs.getString("email"),
            rs.getDate("data_cadastro").toLocalDate(), rs.getString("endereco_rua"),
            rs.getString("endereco_numero"), rs.getString("endereco_bairro"),
            rs.getString("endereco_cidade"), rs.getString("endereco_cep"), splitPhones(rs.getString("telefones")));

    private final JdbcClient jdbcClient;
    private final JdbcTemplate jdbcTemplate;

    public TutorRepository(JdbcClient jdbcClient, JdbcTemplate jdbcTemplate) {
        this.jdbcClient = jdbcClient;
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<TutorSummary> findAll() {
        return jdbcClient.sql("""
                SELECT u.cpf, u.nome, u.email
                  FROM Tutor t JOIN Usuario u ON u.cpf = t.cpf
                 ORDER BY u.nome
                """)
                .query((rs, rowNum) -> new TutorSummary(
                        rs.getString("cpf"), rs.getString("nome"), rs.getString("email")))
                .list();
    }

    public Optional<TutorResponse> findByCpf(String cpf) {
        return jdbcClient.sql(SELECT_DETAIL + " WHERE u.cpf = :cpf" + GROUP_BY)
                .param("cpf", cpf)
                .query(DETAIL_MAPPER)
                .optional();
    }

    public boolean existsByCpf(String cpf) {
        return jdbcClient.sql("SELECT COUNT(*) FROM Tutor WHERE cpf = :cpf")
                .param("cpf", cpf)
                .query(Integer.class)
                .single() > 0;
    }

    public boolean existsUsuario(String cpf) {
        return jdbcClient.sql("SELECT COUNT(*) FROM Usuario WHERE cpf = :cpf")
                .param("cpf", cpf)
                .query(Integer.class)
                .single() > 0;
    }

    public void insertUsuario(TutorRequest request, String senhaHash) {
        jdbcClient.sql("""
                INSERT INTO Usuario
                    (cpf, nome, email, senha, data_cadastro, endereco_rua, endereco_numero,
                     endereco_bairro, endereco_cidade, endereco_cep)
                VALUES
                    (:cpf, :nome, :email, :senha, CURRENT_DATE, :rua, :numero, :bairro, :cidade, :cep)
                """)
                .param("cpf", request.cpf())
                .param("nome", request.nome().trim())
                .param("email", request.email().trim())
                .param("senha", senhaHash)
                .param("rua", request.enderecoRua().trim())
                .param("numero", request.enderecoNumero().trim())
                .param("bairro", request.enderecoBairro().trim())
                .param("cidade", request.enderecoCidade().trim())
                .param("cep", request.enderecoCep().trim())
                .update();
    }

    public void insertTutor(String cpf) {
        jdbcClient.sql("INSERT INTO Tutor (cpf) VALUES (:cpf)").param("cpf", cpf).update();
    }

    public int updateUsuario(String cpf, TutorRequest request, String senhaHash) {
        String senhaClause = senhaHash == null ? "" : ", senha = :senha";
        JdbcClient.StatementSpec statement = jdbcClient.sql("""
                UPDATE Usuario
                   SET nome = :nome, email = :email, endereco_rua = :rua,
                       endereco_numero = :numero, endereco_bairro = :bairro,
                       endereco_cidade = :cidade, endereco_cep = :cep
                """ + senhaClause + " WHERE cpf = :cpf")
                .param("nome", request.nome().trim())
                .param("email", request.email().trim())
                .param("rua", request.enderecoRua().trim())
                .param("numero", request.enderecoNumero().trim())
                .param("bairro", request.enderecoBairro().trim())
                .param("cidade", request.enderecoCidade().trim())
                .param("cep", request.enderecoCep().trim())
                .param("cpf", cpf);
        if (senhaHash != null) statement = statement.param("senha", senhaHash);
        return statement.update();
    }

    public void replacePhones(String cpf, List<String> phones) {
        jdbcClient.sql("DELETE FROM Telefone WHERE usuario_cpf = :cpf").param("cpf", cpf).update();
        if (phones == null || phones.isEmpty()) return;
        jdbcTemplate.batchUpdate("INSERT INTO Telefone (usuario_cpf, numero) VALUES (?, ?)",
                phones.stream().filter(phone -> phone != null && !phone.isBlank()).toList(),
                phones.size(),
                (PreparedStatement ps, String phone) -> {
                    ps.setString(1, cpf);
                    ps.setString(2, phone.trim());
                });
    }

    public int deleteUsuario(String cpf) {
        return jdbcClient.sql("DELETE FROM Usuario WHERE cpf = :cpf").param("cpf", cpf).update();
    }

    private static List<String> splitPhones(String phones) {
        return phones == null || phones.isBlank() ? List.of() : Arrays.asList(phones.split("\\|\\|"));
    }
}
