package br.edu.vetcare.repository;

import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import java.util.Optional;

import br.edu.vetcare.dto.animal.AnimalRequest;
import br.edu.vetcare.dto.animal.AnimalResponse;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

@Repository
public class AnimalRepository {
    private static final String SELECT_BASE = """
            SELECT a.id_animal, a.nome, a.especie, a.raca, a.sexo, a.peso, a.data_nascimento,
                   MIN(ta.tutor_cpf) AS tutor_cpf,
                   GROUP_CONCAT(DISTINCT u.nome ORDER BY u.nome SEPARATOR ', ') AS tutor
              FROM Animal a
              LEFT JOIN Tutor_Animal ta ON ta.animal_id = a.id_animal
              LEFT JOIN Usuario u ON u.cpf = ta.tutor_cpf
            """;

    private static final String GROUP_BY = """
             GROUP BY a.id_animal, a.nome, a.especie, a.raca, a.sexo, a.peso, a.data_nascimento
            """;

    private static final RowMapper<AnimalResponse> MAPPER = (rs, rowNum) -> new AnimalResponse(
            rs.getInt("id_animal"),
            rs.getString("nome"),
            rs.getString("especie"),
            rs.getString("raca"),
            rs.getString("sexo"),
            rs.getBigDecimal("peso"),
            rs.getDate("data_nascimento") == null ? null : rs.getDate("data_nascimento").toLocalDate(),
            rs.getString("tutor_cpf"),
            rs.getString("tutor"));

    private final JdbcClient jdbcClient;
    private final JdbcTemplate jdbcTemplate;

    public AnimalRepository(JdbcClient jdbcClient, JdbcTemplate jdbcTemplate) {
        this.jdbcClient = jdbcClient;
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<AnimalResponse> findAll() {
        return jdbcClient.sql(SELECT_BASE + GROUP_BY + " ORDER BY a.nome")
                .query(MAPPER)
                .list();
    }

    public Optional<AnimalResponse> findById(int id) {
        return jdbcClient.sql(SELECT_BASE + " WHERE a.id_animal = :id" + GROUP_BY)
                .param("id", id)
                .query(MAPPER)
                .optional();
    }

    public int insert(AnimalRequest request) {
        String sql = """
                INSERT INTO Animal (nome, especie, raca, sexo, peso, data_nascimento)
                VALUES (?, ?, ?, ?, ?, ?)
                """;
        KeyHolder keys = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement statement = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            statement.setString(1, request.nome().trim());
            statement.setString(2, request.especie().trim());
            statement.setString(3, blankToNull(request.raca()));
            statement.setString(4, request.sexo());
            statement.setBigDecimal(5, request.peso());
            statement.setDate(6, request.dataNascimento() == null ? null : Date.valueOf(request.dataNascimento()));
            return statement;
        }, keys);
        return keys.getKey().intValue();
    }

    public int update(int id, AnimalRequest request) {
        return jdbcClient.sql("""
                UPDATE Animal
                   SET nome = :nome, especie = :especie, raca = :raca, sexo = :sexo,
                       peso = :peso, data_nascimento = :dataNascimento
                 WHERE id_animal = :id
                """)
                .param("nome", request.nome().trim())
                .param("especie", request.especie().trim())
                .param("raca", blankToNull(request.raca()))
                .param("sexo", request.sexo())
                .param("peso", request.peso())
                .param("dataNascimento", request.dataNascimento())
                .param("id", id)
                .update();
    }

    public int delete(int id) {
        return jdbcClient.sql("DELETE FROM Animal WHERE id_animal = :id")
                .param("id", id)
                .update();
    }

    public void replaceTutor(int animalId, String tutorCpf) {
        jdbcClient.sql("DELETE FROM Tutor_Animal WHERE animal_id = :animalId")
                .param("animalId", animalId)
                .update();
        jdbcClient.sql("INSERT INTO Tutor_Animal (tutor_cpf, animal_id) VALUES (:cpf, :animalId)")
                .param("cpf", tutorCpf)
                .param("animalId", animalId)
                .update();
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
