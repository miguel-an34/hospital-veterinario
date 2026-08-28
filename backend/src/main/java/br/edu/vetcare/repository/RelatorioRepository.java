package br.edu.vetcare.repository;

import java.math.BigDecimal;
import java.sql.Date;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.util.List;

import br.edu.vetcare.dto.relatorio.AgendaDiariaView;
import br.edu.vetcare.dto.relatorio.AtendimentoPorProfissionalView;
import br.edu.vetcare.dto.relatorio.ExameRelatorioView;
import br.edu.vetcare.dto.relatorio.HistoricoClinicoView;
import br.edu.vetcare.dto.relatorio.HistoricoPorPacienteView;
import br.edu.vetcare.dto.relatorio.InternacaoAtivaView;

import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class RelatorioRepository {
    private static final RowMapper<HistoricoClinicoView> HISTORICO_CLINICO_MAPPER = (rs, rowNum) ->
            new HistoricoClinicoView(
                    rs.getString("paciente"),
                    rs.getString("especie"),
                    rs.getTimestamp("data_atendimento").toLocalDateTime(),
                    rs.getString("diagnostico"),
                    rs.getString("veterinario_responsavel"));

    private static final RowMapper<InternacaoAtivaView> INTERNACAO_ATIVA_MAPPER = (rs, rowNum) ->
            new InternacaoAtivaView(
                    rs.getString("leito"),
                    rs.getString("paciente"),
                    rs.getTimestamp("data_entrada").toLocalDateTime(),
                    rs.getString("tutor_responsavel"),
                    rs.getString("observacoes"));

    private static final RowMapper<AgendaDiariaView> AGENDA_DIARIA_MAPPER = (rs, rowNum) ->
            new AgendaDiariaView(
                    rs.getTime("horario").toLocalTime(),
                    rs.getString("motivo"),
                    rs.getString("paciente"),
                    rs.getString("tutor"));

    private static final RowMapper<ExameRelatorioView> EXAME_RELATORIO_MAPPER = (rs, rowNum) -> {
        Date dataResultado = rs.getDate("data_resultado");
        return new ExameRelatorioView(
                rs.getInt("id_exame"),
                rs.getString("tipo"),
                rs.getString("resultado"),
                rs.getString("observacoes"),
                rs.getDate("data_solicitacao").toLocalDate(),
                dataResultado == null ? null : dataResultado.toLocalDate(),
                rs.getInt("id_consulta"),
                rs.getInt("id_animal"),
                rs.getString("paciente"),
                rs.getString("veterinario"));
    };

    private static final RowMapper<AtendimentoPorProfissionalView> ATENDIMENTO_ANALITICO_MAPPER = (rs, rowNum) ->
            new AtendimentoPorProfissionalView(
                    rs.getString("veterinario_cpf"),
                    rs.getString("profissional"),
                    rs.getInt("ano"),
                    rs.getInt("mes"),
                    rs.getLong("quantidade_atendimentos"),
                    rs.getObject("faturamento_total", BigDecimal.class));

    private static final RowMapper<HistoricoPorPacienteView> HISTORICO_PACIENTE_MAPPER = (rs, rowNum) -> {
        Date dataNascimento = rs.getDate("data_nascimento");
        Timestamp dataConsulta = rs.getTimestamp("data_consulta");
        return new HistoricoPorPacienteView(
                rs.getInt("id_consulta"),
                rs.getInt("id_animal"),
                rs.getString("paciente"),
                rs.getString("especie"),
                rs.getString("raca"),
                rs.getString("sexo"),
                rs.getObject("peso", BigDecimal.class),
                dataNascimento == null ? null : dataNascimento.toLocalDate(),
                rs.getString("tutor_cpf"),
                rs.getString("tutor"),
                rs.getString("veterinario_cpf"),
                rs.getString("veterinario"),
                dataConsulta == null ? null : dataConsulta.toLocalDateTime(),
                rs.getString("status"),
                rs.getString("observacoes"),
                rs.getString("diagnostico"));
    };

    private final JdbcClient jdbcClient;

    public RelatorioRepository(JdbcClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    public List<HistoricoClinicoView> historicoClinico() {
        return jdbcClient.sql("SELECT * FROM v_historico_clinico ORDER BY data_atendimento DESC, paciente")
                .query(HISTORICO_CLINICO_MAPPER).list();
    }

    public List<InternacaoAtivaView> internacoesAtivas() {
        return jdbcClient.sql("SELECT * FROM v_internacoes_ativas ORDER BY data_entrada, leito")
                .query(INTERNACAO_ATIVA_MAPPER).list();
    }

    public List<AgendaDiariaView> agendaDiaria() {
        return jdbcClient.sql("SELECT * FROM v_agenda_diaria")
                .query(AGENDA_DIARIA_MAPPER).list();
    }

    public List<InternacaoAtivaView> internacoesAtivasPorPeriodo(LocalDate dataInicio, LocalDate dataFim) {
        return jdbcClient.sql("""
                SELECT *
                FROM v_internacoes_ativas
                WHERE (:dataInicio IS NULL OR DATE(data_entrada) >= :dataInicio)
                  AND (:dataFim IS NULL OR DATE(data_entrada) <= :dataFim)
                ORDER BY data_entrada, leito
                """)
                .param("dataInicio", dataInicio)
                .param("dataFim", dataFim)
                .query(INTERNACAO_ATIVA_MAPPER)
                .list();
    }

    public List<ExameRelatorioView> examesPorPeriodo(LocalDate dataInicio, LocalDate dataFim) {
        return jdbcClient.sql("""
                SELECT
                    e.id_exame,
                    e.tipo,
                    e.resultado,
                    e.observacoes,
                    e.data_solicitacao,
                    e.data_resultado,
                    con.id_consulta,
                    a.id_animal,
                    a.nome AS paciente,
                    u.nome AS veterinario
                FROM Exame e
                JOIN Consulta con ON con.id_consulta = e.consulta_id
                JOIN Animal a ON a.id_animal = con.animal_id
                JOIN Usuario u ON u.cpf = con.veterinario_cpf
                WHERE (:dataInicio IS NULL OR e.data_solicitacao >= :dataInicio)
                  AND (:dataFim IS NULL OR e.data_solicitacao <= :dataFim)
                ORDER BY e.data_solicitacao DESC, e.id_exame DESC
                """)
                .param("dataInicio", dataInicio)
                .param("dataFim", dataFim)
                .query(EXAME_RELATORIO_MAPPER)
                .list();
    }

    public List<AtendimentoPorProfissionalView> atendimentosPorPeriodo(LocalDate dataInicio, LocalDate dataFim) {
        return jdbcClient.sql("""
                SELECT
                    con.veterinario_cpf,
                    u.nome AS profissional,
                    YEAR(COALESCE(TIMESTAMP(ag.data, ag.horario), TIMESTAMP(rc.data_referencia, '00:00:00'))) AS ano,
                    MONTH(COALESCE(TIMESTAMP(ag.data, ag.horario), TIMESTAMP(rc.data_referencia, '00:00:00'))) AS mes,
                    COUNT(con.id_consulta) AS quantidade_atendimentos,
                    CAST(0.00 AS DECIMAL(10,2)) AS faturamento_total
                FROM Consulta con
                JOIN Veterinario v ON v.cpf = con.veterinario_cpf
                JOIN Funcionario f ON f.cpf = v.cpf
                JOIN Usuario u ON u.cpf = f.cpf
                LEFT JOIN Agendamento ag ON ag.id_agendamento = con.agendamento_id
                LEFT JOIN (
                    SELECT consulta_id, MAX(data_registro) AS data_referencia
                    FROM RegistroClinico
                    GROUP BY consulta_id
                ) rc ON rc.consulta_id = con.id_consulta
                WHERE (:dataInicio IS NULL OR
                       COALESCE(TIMESTAMP(ag.data, ag.horario), TIMESTAMP(rc.data_referencia, '00:00:00')) >=
                       CAST(DATE_FORMAT(:dataInicio, '%Y-%m-01') AS DATE))
                  AND (:dataFim IS NULL OR
                       COALESCE(TIMESTAMP(ag.data, ag.horario), TIMESTAMP(rc.data_referencia, '00:00:00')) <
                       DATE_ADD(CAST(DATE_FORMAT(:dataFim, '%Y-%m-01') AS DATE), INTERVAL 1 MONTH))
                  AND COALESCE(TIMESTAMP(ag.data, ag.horario), TIMESTAMP(rc.data_referencia, '00:00:00')) IS NOT NULL
                GROUP BY
                    con.veterinario_cpf,
                    u.nome,
                    YEAR(COALESCE(TIMESTAMP(ag.data, ag.horario), TIMESTAMP(rc.data_referencia, '00:00:00'))),
                    MONTH(COALESCE(TIMESTAMP(ag.data, ag.horario), TIMESTAMP(rc.data_referencia, '00:00:00')))
                ORDER BY ano DESC, mes DESC, profissional
                """)
                .param("dataInicio", dataInicio)
                .param("dataFim", dataFim)
                .query(ATENDIMENTO_ANALITICO_MAPPER)
                .list();
    }

    public List<HistoricoPorPacienteView> historicoPorPeriodo(LocalDate dataInicio, LocalDate dataFim) {
        return jdbcClient.sql("""
                SELECT *
                FROM v_historico_por_paciente
                WHERE (:dataInicio IS NULL OR DATE(data_consulta) >= :dataInicio)
                  AND (:dataFim IS NULL OR DATE(data_consulta) <= :dataFim)
                ORDER BY data_consulta DESC, paciente
                """)
                .param("dataInicio", dataInicio)
                .param("dataFim", dataFim)
                .query(HISTORICO_PACIENTE_MAPPER)
                .list();
    }
}
