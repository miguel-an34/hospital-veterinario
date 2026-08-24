package br.edu.vetcare.repository;

import java.util.List;

import br.edu.vetcare.dto.relatorio.AgendaDiariaView;
import br.edu.vetcare.dto.relatorio.HistoricoClinicoView;
import br.edu.vetcare.dto.relatorio.InternacaoAtivaView;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class RelatorioRepository {
    private final JdbcClient jdbcClient;

    public RelatorioRepository(JdbcClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    public List<HistoricoClinicoView> historicoClinico() {
        return jdbcClient.sql("SELECT * FROM v_historico_clinico ORDER BY data_atendimento DESC, paciente")
                .query((rs, rowNum) -> new HistoricoClinicoView(
                        rs.getString("paciente"), rs.getString("especie"),
                        rs.getTimestamp("data_atendimento").toLocalDateTime(), rs.getString("diagnostico"),
                        rs.getString("veterinario_responsavel")))
                .list();
    }

    public List<InternacaoAtivaView> internacoesAtivas() {
        return jdbcClient.sql("SELECT * FROM v_internacoes_ativas ORDER BY data_entrada, leito")
                .query((rs, rowNum) -> new InternacaoAtivaView(
                        rs.getString("leito"), rs.getString("paciente"),
                        rs.getTimestamp("data_entrada").toLocalDateTime(), rs.getString("tutor_responsavel"),
                        rs.getString("observacoes")))
                .list();
    }

    public List<AgendaDiariaView> agendaDiaria() {
        return jdbcClient.sql("SELECT * FROM v_agenda_diaria")
                .query((rs, rowNum) -> new AgendaDiariaView(
                        rs.getTime("horario").toLocalTime(), rs.getString("motivo"),
                        rs.getString("paciente"), rs.getString("tutor")))
                .list();
    }
}
