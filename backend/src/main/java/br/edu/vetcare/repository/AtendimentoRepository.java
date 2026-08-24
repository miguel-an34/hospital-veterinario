package br.edu.vetcare.repository;

import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Time;
import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

import br.edu.vetcare.dto.agendamento.AgendamentoRequest;
import br.edu.vetcare.dto.agendamento.AgendamentoResponse;
import br.edu.vetcare.dto.consulta.ConsultaRequest;
import br.edu.vetcare.dto.consulta.ConsultaResponse;
import br.edu.vetcare.dto.exame.ExameRequest;
import br.edu.vetcare.dto.exame.ExameResponse;
import br.edu.vetcare.dto.registro.RegistroClinicoRequest;
import br.edu.vetcare.dto.registro.RegistroClinicoResponse;
import br.edu.vetcare.dto.veterinario.VeterinarioResponse;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.PreparedStatementCreator;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

@Repository
public class AtendimentoRepository {
    private final JdbcClient jdbcClient;
    private final JdbcTemplate jdbcTemplate;

    public AtendimentoRepository(JdbcClient jdbcClient, JdbcTemplate jdbcTemplate) {
        this.jdbcClient = jdbcClient;
        this.jdbcTemplate = jdbcTemplate;
    }

    private static final RowMapper<AgendamentoResponse> AGENDAMENTO_MAPPER = (rs, rowNum) ->
            new AgendamentoResponse(rs.getInt("id_agendamento"), rs.getDate("data").toLocalDate(),
                    rs.getTime("horario").toLocalTime(), rs.getString("motivo"), rs.getString("tutor_cpf"),
                    rs.getString("tutor"), rs.getInt("animal_id"), rs.getString("animal"));

    private static final RowMapper<ConsultaResponse> CONSULTA_MAPPER = (rs, rowNum) ->
            new ConsultaResponse(rs.getInt("id_consulta"), rs.getTimestamp("data_hora").toLocalDateTime(),
                    rs.getString("observacoes"), rs.getString("status"),
                    rs.getInt("animal_id"), rs.getString("animal"), rs.getString("veterinario_cpf"),
                    rs.getString("veterinario"), (Integer) rs.getObject("agendamento_id"));

    private static final RowMapper<RegistroClinicoResponse> REGISTRO_MAPPER = (rs, rowNum) ->
            new RegistroClinicoResponse(rs.getInt("id_registro"), rs.getString("descricao"),
                    rs.getDate("data_registro").toLocalDate(), rs.getInt("consulta_id"), rs.getString("paciente"));

    private static final RowMapper<ExameResponse> EXAME_MAPPER = (rs, rowNum) ->
            new ExameResponse(rs.getInt("id_exame"), rs.getString("tipo"), rs.getString("resultado"),
                    rs.getString("observacoes"), rs.getDate("data_solicitacao").toLocalDate(),
                    rs.getDate("data_resultado") == null ? null : rs.getDate("data_resultado").toLocalDate(),
                    rs.getInt("consulta_id"), rs.getString("paciente"));

    private static final String AGENDAMENTO_SELECT = """
            SELECT ag.id_agendamento, ag.data, ag.horario, ag.motivo, ag.tutor_cpf,
                   u.nome AS tutor, ag.animal_id, a.nome AS animal
              FROM Agendamento ag
              JOIN Usuario u ON u.cpf = ag.tutor_cpf
              JOIN Animal a ON a.id_animal = ag.animal_id
            """;

    private static final String CONSULTA_SELECT = """
            SELECT c.id_consulta, c.data_hora, c.observacoes, c.status, c.animal_id, a.nome AS animal,
                   c.veterinario_cpf, u.nome AS veterinario, c.agendamento_id
              FROM Consulta c
              JOIN Animal a ON a.id_animal = c.animal_id
              JOIN Usuario u ON u.cpf = c.veterinario_cpf
            """;

    private static final String REGISTRO_SELECT = """
            SELECT r.id_registro, r.descricao, r.data_registro, r.consulta_id, a.nome AS paciente
              FROM RegistroClinico r
              JOIN Consulta c ON c.id_consulta = r.consulta_id
              JOIN Animal a ON a.id_animal = c.animal_id
            """;

    private static final String EXAME_SELECT = """
            SELECT e.id_exame, e.tipo, e.resultado, e.observacoes, e.data_solicitacao,
                   e.data_resultado, e.consulta_id, a.nome AS paciente
              FROM Exame e
              JOIN Consulta c ON c.id_consulta = e.consulta_id
              JOIN Animal a ON a.id_animal = c.animal_id
            """;

    public List<AgendamentoResponse> findAllAgendamentos() {
        return jdbcClient.sql(AGENDAMENTO_SELECT + " ORDER BY ag.data DESC, ag.horario").query(AGENDAMENTO_MAPPER).list();
    }

    public Optional<AgendamentoResponse> findAgendamento(int id) {
        return jdbcClient.sql(AGENDAMENTO_SELECT + " WHERE ag.id_agendamento = :id")
                .param("id", id).query(AGENDAMENTO_MAPPER).optional();
    }

    public int insertAgendamento(AgendamentoRequest request) {
        return generatedKey(connection -> {
            PreparedStatement ps = connection.prepareStatement("""
                    INSERT INTO Agendamento (data, horario, motivo, tutor_cpf, animal_id)
                    VALUES (?, ?, ?, ?, ?)
                    """, Statement.RETURN_GENERATED_KEYS);
            ps.setDate(1, Date.valueOf(request.data()));
            ps.setTime(2, Time.valueOf(request.horario()));
            ps.setString(3, request.motivo().trim());
            ps.setString(4, request.tutorCpf());
            ps.setInt(5, request.animalId());
            return ps;
        });
    }

    public int updateAgendamento(int id, AgendamentoRequest request) {
        return jdbcClient.sql("""
                UPDATE Agendamento SET data=:data, horario=:horario, motivo=:motivo,
                       tutor_cpf=:tutorCpf, animal_id=:animalId WHERE id_agendamento=:id
                """).param("data", request.data()).param("horario", request.horario())
                .param("motivo", request.motivo().trim()).param("tutorCpf", request.tutorCpf())
                .param("animalId", request.animalId()).param("id", id).update();
    }

    public int deleteAgendamento(int id) {
        return jdbcClient.sql("DELETE FROM Agendamento WHERE id_agendamento=:id").param("id", id).update();
    }

    public List<ConsultaResponse> findAllConsultas() {
        return jdbcClient.sql(CONSULTA_SELECT + " ORDER BY c.id_consulta DESC").query(CONSULTA_MAPPER).list();
    }

    public Optional<ConsultaResponse> findConsulta(int id) {
        return jdbcClient.sql(CONSULTA_SELECT + " WHERE c.id_consulta=:id")
                .param("id", id).query(CONSULTA_MAPPER).optional();
    }

    public int insertConsulta(ConsultaRequest request) {
        return generatedKey(connection -> {
            PreparedStatement ps = connection.prepareStatement("""
                    INSERT INTO Consulta (data_hora, observacoes, status, animal_id, veterinario_cpf, agendamento_id)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """, Statement.RETURN_GENERATED_KEYS);
            ps.setTimestamp(1, Timestamp.valueOf(request.dataHora()));
            ps.setString(2, blankToNull(request.observacoes()));
            ps.setString(3, request.status().trim());
            ps.setInt(4, request.animalId());
            ps.setString(5, request.veterinarioCpf());
            if (request.agendamentoId() == null) ps.setNull(6, java.sql.Types.INTEGER);
            else ps.setInt(6, request.agendamentoId());
            return ps;
        });
    }

    public int updateConsulta(int id, ConsultaRequest request) {
        return jdbcClient.sql("""
                UPDATE Consulta SET data_hora=:dataHora, observacoes=:observacoes, status=:status, animal_id=:animalId,
                       veterinario_cpf=:veterinarioCpf, agendamento_id=:agendamentoId
                 WHERE id_consulta=:id
                """).param("dataHora", Timestamp.valueOf(request.dataHora()))
                .param("observacoes", blankToNull(request.observacoes())).param("status", request.status().trim())
                .param("animalId", request.animalId()).param("veterinarioCpf", request.veterinarioCpf())
                .param("agendamentoId", request.agendamentoId()).param("id", id).update();
    }

    public int deleteConsulta(int id) {
        return jdbcClient.sql("DELETE FROM Consulta WHERE id_consulta=:id").param("id", id).update();
    }

    public List<RegistroClinicoResponse> findAllRegistros() {
        return jdbcClient.sql(REGISTRO_SELECT + " ORDER BY r.data_registro DESC, r.id_registro DESC")
                .query(REGISTRO_MAPPER).list();
    }

    public Optional<RegistroClinicoResponse> findRegistro(int id) {
        return jdbcClient.sql(REGISTRO_SELECT + " WHERE r.id_registro=:id")
                .param("id", id).query(REGISTRO_MAPPER).optional();
    }

    public int insertRegistro(RegistroClinicoRequest request) {
        return generatedKey(connection -> {
            PreparedStatement ps = connection.prepareStatement("""
                    INSERT INTO RegistroClinico (descricao, data_registro, consulta_id)
                    VALUES (?, ?, ?)
                    """, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, request.descricao().trim());
            ps.setDate(2, Date.valueOf(request.dataRegistro() == null ? java.time.LocalDate.now() : request.dataRegistro()));
            ps.setInt(3, request.consultaId());
            return ps;
        });
    }

    public int updateRegistro(int id, RegistroClinicoRequest request) {
        return jdbcClient.sql("""
                UPDATE RegistroClinico SET descricao=:descricao, data_registro=:data, consulta_id=:consultaId
                 WHERE id_registro=:id
                """).param("descricao", request.descricao().trim())
                .param("data", request.dataRegistro() == null ? java.time.LocalDate.now() : request.dataRegistro())
                .param("consultaId", request.consultaId()).param("id", id).update();
    }

    public int deleteRegistro(int id) {
        return jdbcClient.sql("DELETE FROM RegistroClinico WHERE id_registro=:id").param("id", id).update();
    }

    public List<ExameResponse> findAllExames() {
        return jdbcClient.sql(EXAME_SELECT + " ORDER BY e.data_solicitacao DESC, e.id_exame DESC")
                .query(EXAME_MAPPER).list();
    }

    public Optional<ExameResponse> findExame(int id) {
        return jdbcClient.sql(EXAME_SELECT + " WHERE e.id_exame=:id")
                .param("id", id).query(EXAME_MAPPER).optional();
    }

    public int insertExame(ExameRequest request) {
        return generatedKey(connection -> {
            PreparedStatement ps = connection.prepareStatement("""
                    INSERT INTO Exame (tipo, resultado, observacoes, data_solicitacao, data_resultado, consulta_id)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, request.tipo().trim());
            ps.setString(2, blankToNull(request.resultado()));
            ps.setString(3, blankToNull(request.observacoes()));
            ps.setDate(4, Date.valueOf(request.dataSolicitacao() == null ? java.time.LocalDate.now() : request.dataSolicitacao()));
            ps.setDate(5, request.dataResultado() == null ? null : Date.valueOf(request.dataResultado()));
            ps.setInt(6, request.consultaId());
            return ps;
        });
    }

    public int updateExame(int id, ExameRequest request) {
        return jdbcClient.sql("""
                UPDATE Exame SET tipo=:tipo, resultado=:resultado, observacoes=:observacoes,
                       data_solicitacao=:solicitacao, data_resultado=:resultadoData, consulta_id=:consultaId
                 WHERE id_exame=:id
                """).param("tipo", request.tipo().trim()).param("resultado", blankToNull(request.resultado()))
                .param("observacoes", blankToNull(request.observacoes()))
                .param("solicitacao", request.dataSolicitacao() == null ? java.time.LocalDate.now() : request.dataSolicitacao())
                .param("resultadoData", request.dataResultado()).param("consultaId", request.consultaId())
                .param("id", id).update();
    }

    public int deleteExame(int id) {
        return jdbcClient.sql("DELETE FROM Exame WHERE id_exame=:id").param("id", id).update();
    }

    public List<VeterinarioResponse> findVeterinarios() {
        return jdbcClient.sql("""
                SELECT v.cpf, u.nome, v.crmv, v.especialidade
                  FROM Veterinario v JOIN Usuario u ON u.cpf = v.cpf ORDER BY u.nome
                """).query((rs, rowNum) -> new VeterinarioResponse(rs.getString("cpf"), rs.getString("nome"),
                        rs.getString("crmv"), rs.getString("especialidade"))).list();
    }

    public boolean exists(String table, String idColumn, Object id) {
        String sql = switch (table) {
            case "Animal" -> "SELECT COUNT(*) FROM Animal WHERE id_animal=:id";
            case "Tutor" -> "SELECT COUNT(*) FROM Tutor WHERE cpf=:id";
            case "Veterinario" -> "SELECT COUNT(*) FROM Veterinario WHERE cpf=:id";
            case "Agendamento" -> "SELECT COUNT(*) FROM Agendamento WHERE id_agendamento=:id";
            case "Consulta" -> "SELECT COUNT(*) FROM Consulta WHERE id_consulta=:id";
            default -> throw new IllegalArgumentException("Tabela não permitida: " + table + "." + idColumn);
        };
        return jdbcClient.sql(sql).param("id", id).query(Integer.class).single() > 0;
    }

    private int generatedKey(PreparedStatementCreator creator) {
        KeyHolder keys = new GeneratedKeyHolder();
        jdbcTemplate.update(creator, keys);
        return keys.getKey().intValue();
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
