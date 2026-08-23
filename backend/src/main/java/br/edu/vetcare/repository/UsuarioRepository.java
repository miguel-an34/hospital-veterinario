package br.edu.vetcare.repository;

import java.sql.PreparedStatement;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import br.edu.vetcare.dto.usuario.UsuarioRequest;
import br.edu.vetcare.dto.usuario.UsuarioResponse;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class UsuarioRepository {
    private static final String SELECT = """
            SELECT u.cpf, u.nome, u.email, u.data_cadastro, u.endereco_rua, u.endereco_numero,
                   u.endereco_bairro, u.endereco_cidade, u.endereco_cep,
                   GROUP_CONCAT(tel.numero ORDER BY tel.id_telefone SEPARATOR '||') AS telefones,
                   MAX(t.cpf IS NOT NULL) AS tutor, MAX(f.cpf IS NOT NULL) AS funcionario,
                   MAX(v.cpf IS NOT NULL) AS veterinario
              FROM Usuario u
              LEFT JOIN Telefone tel ON tel.usuario_cpf = u.cpf
              LEFT JOIN Tutor t ON t.cpf = u.cpf
              LEFT JOIN Funcionario f ON f.cpf = u.cpf
              LEFT JOIN Veterinario v ON v.cpf = u.cpf
            """;
    private static final String GROUP = """
             GROUP BY u.cpf, u.nome, u.email, u.data_cadastro, u.endereco_rua, u.endereco_numero,
                      u.endereco_bairro, u.endereco_cidade, u.endereco_cep
            """;
    private static final RowMapper<UsuarioResponse> MAPPER = (rs, rowNum) -> new UsuarioResponse(
            rs.getString("cpf"), rs.getString("nome"), rs.getString("email"),
            rs.getDate("data_cadastro").toLocalDate(), rs.getString("endereco_rua"),
            rs.getString("endereco_numero"), rs.getString("endereco_bairro"),
            rs.getString("endereco_cidade"), rs.getString("endereco_cep"),
            splitPhones(rs.getString("telefones")), rs.getBoolean("tutor"),
            rs.getBoolean("funcionario"), rs.getBoolean("veterinario"));

    private final JdbcClient jdbcClient;
    private final JdbcTemplate jdbcTemplate;

    public UsuarioRepository(JdbcClient jdbcClient, JdbcTemplate jdbcTemplate) {
        this.jdbcClient = jdbcClient;
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<UsuarioResponse> findAll() {
        return jdbcClient.sql(SELECT + GROUP + " ORDER BY u.nome").query(MAPPER).list();
    }

    public Optional<UsuarioResponse> findByCpf(String cpf) {
        return jdbcClient.sql(SELECT + " WHERE u.cpf=:cpf" + GROUP)
                .param("cpf", cpf).query(MAPPER).optional();
    }

    public boolean exists(String cpf) {
        return jdbcClient.sql("SELECT COUNT(*) FROM Usuario WHERE cpf=:cpf")
                .param("cpf", cpf).query(Integer.class).single() > 0;
    }

    public void insert(UsuarioRequest request, String senhaHash) {
        jdbcClient.sql("""
                INSERT INTO Usuario
                    (cpf, nome, email, senha, data_cadastro, endereco_rua, endereco_numero,
                     endereco_bairro, endereco_cidade, endereco_cep)
                VALUES (:cpf, :nome, :email, :senha, CURRENT_DATE, :rua, :numero, :bairro, :cidade, :cep)
                """)
                .param("cpf", request.cpf()).param("nome", request.nome().trim())
                .param("email", request.email().trim()).param("senha", senhaHash)
                .param("rua", request.enderecoRua().trim()).param("numero", request.enderecoNumero().trim())
                .param("bairro", request.enderecoBairro().trim()).param("cidade", request.enderecoCidade().trim())
                .param("cep", request.enderecoCep().trim()).update();
        replacePhones(request.cpf(), request.telefones());
    }

    public int update(String cpf, UsuarioRequest request, String senhaHash) {
        String senhaClause = senhaHash == null ? "" : ", senha=:senha";
        JdbcClient.StatementSpec statement = jdbcClient.sql("""
                UPDATE Usuario SET nome=:nome, email=:email, endereco_rua=:rua,
                       endereco_numero=:numero, endereco_bairro=:bairro,
                       endereco_cidade=:cidade, endereco_cep=:cep
                """ + senhaClause + " WHERE cpf=:cpf")
                .param("nome", request.nome().trim()).param("email", request.email().trim())
                .param("rua", request.enderecoRua().trim()).param("numero", request.enderecoNumero().trim())
                .param("bairro", request.enderecoBairro().trim()).param("cidade", request.enderecoCidade().trim())
                .param("cep", request.enderecoCep().trim()).param("cpf", cpf);
        if (senhaHash != null) statement = statement.param("senha", senhaHash);
        int updated = statement.update();
        replacePhones(cpf, request.telefones());
        return updated;
    }

    public int delete(String cpf) {
        return jdbcClient.sql("DELETE FROM Usuario WHERE cpf=:cpf").param("cpf", cpf).update();
    }

    private void replacePhones(String cpf, List<String> phones) {
        jdbcClient.sql("DELETE FROM Telefone WHERE usuario_cpf=:cpf").param("cpf", cpf).update();
        if (phones == null || phones.isEmpty()) return;
        List<String> validPhones = phones.stream().filter(phone -> phone != null && !phone.isBlank()).toList();
        jdbcTemplate.batchUpdate("INSERT INTO Telefone (usuario_cpf, numero) VALUES (?, ?)", validPhones,
                Math.max(1, validPhones.size()), (PreparedStatement ps, String phone) -> {
                    ps.setString(1, cpf); ps.setString(2, phone.trim());
                });
    }

    private static List<String> splitPhones(String phones) {
        return phones == null || phones.isBlank() ? List.of() : Arrays.asList(phones.split("\\|\\|"));
    }
}
