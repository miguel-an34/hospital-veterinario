package br.edu.vetcare.service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;

import br.edu.vetcare.dto.relatorio.AgendaDiariaView;
import br.edu.vetcare.dto.relatorio.AtendimentoPorProfissionalView;
import br.edu.vetcare.dto.relatorio.ExameRelatorioView;
import br.edu.vetcare.dto.relatorio.HistoricoClinicoView;
import br.edu.vetcare.dto.relatorio.HistoricoPorPacienteView;
import br.edu.vetcare.dto.relatorio.InternacaoAtivaView;
import br.edu.vetcare.repository.RelatorioRepository;

import org.springframework.stereotype.Service;

@Service
public class RelatorioService {
    private final RelatorioRepository repository;

    public RelatorioService(RelatorioRepository repository) {
        this.repository = repository;
    }

    public List<HistoricoClinicoView> historicoClinico() {
        return repository.historicoClinico();
    }

    public List<InternacaoAtivaView> internacoesAtivas() {
        return repository.internacoesAtivas();
    }

    public List<AgendaDiariaView> agendaDiaria() {
        return repository.agendaDiaria();
    }

    public List<InternacaoAtivaView> internacoes(LocalDate dataInicio, LocalDate dataFim) {
        validarPeriodo(dataInicio, dataFim);
        return repository.internacoesAtivasPorPeriodo(dataInicio, dataFim);
    }

    public List<ExameRelatorioView> exames(LocalDate dataInicio, LocalDate dataFim) {
        validarPeriodo(dataInicio, dataFim);
        return repository.examesPorPeriodo(dataInicio, dataFim);
    }

    public List<AtendimentoPorProfissionalView> atendimentos(LocalDate dataInicio, LocalDate dataFim) {
        validarPeriodo(dataInicio, dataFim);
        return repository.atendimentosPorPeriodo(dataInicio, dataFim);
    }

    public List<HistoricoPorPacienteView> historico(LocalDate dataInicio, LocalDate dataFim) {
        validarPeriodo(dataInicio, dataFim);
        return repository.historicoPorPeriodo(dataInicio, dataFim);
    }

    public byte[] exportarAtendimentosCsv(LocalDate dataInicio, LocalDate dataFim) {
        List<AtendimentoPorProfissionalView> itens = atendimentos(dataInicio, dataFim);
        StringBuilder csv = new StringBuilder("veterinario_cpf,profissional,ano,mes,quantidade_atendimentos,faturamento_total\n");
        for (AtendimentoPorProfissionalView item : itens) {
            appendRow(csv,
                    item.veterinarioCpf(),
                    item.profissional(),
                    item.ano(),
                    item.mes(),
                    item.quantidadeAtendimentos(),
                    item.faturamentoTotal());
        }
        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    public byte[] exportarHistoricoCsv(LocalDate dataInicio, LocalDate dataFim) {
        List<HistoricoPorPacienteView> itens = historico(dataInicio, dataFim);
        StringBuilder csv = new StringBuilder(
                "id_consulta,id_animal,paciente,especie,raca,sexo,peso,data_nascimento,tutor_cpf,tutor,"
                        + "veterinario_cpf,veterinario,data_consulta,status,observacoes,diagnostico\n");
        for (HistoricoPorPacienteView item : itens) {
            appendRow(csv,
                    item.idConsulta(),
                    item.idAnimal(),
                    item.paciente(),
                    item.especie(),
                    item.raca(),
                    item.sexo(),
                    item.peso(),
                    item.dataNascimento(),
                    item.tutorCpf(),
                    item.tutor(),
                    item.veterinarioCpf(),
                    item.veterinario(),
                    item.dataConsulta(),
                    item.status(),
                    item.observacoes(),
                    item.diagnostico());
        }
        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    public byte[] exportarInternacoesCsv(LocalDate dataInicio, LocalDate dataFim) {
        List<InternacaoAtivaView> itens = internacoes(dataInicio, dataFim);
        StringBuilder csv = new StringBuilder("leito,paciente,data_entrada,tutor_responsavel,observacoes\n");
        for (InternacaoAtivaView item : itens) {
            appendRow(csv,
                    item.leito(),
                    item.paciente(),
                    item.dataEntrada(),
                    item.tutorResponsavel(),
                    item.observacoes());
        }
        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    public byte[] exportarAgendaDiariaCsv() {
        List<AgendaDiariaView> itens = agendaDiaria();
        StringBuilder csv = new StringBuilder("horario,motivo,paciente,tutor\n");
        for (AgendaDiariaView item : itens) {
            appendRow(csv,
                    item.horario(),
                    item.motivo(),
                    item.paciente(),
                    item.tutor());
        }
        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    public byte[] exportarExamesCsv(LocalDate dataInicio, LocalDate dataFim) {
        List<ExameRelatorioView> itens = exames(dataInicio, dataFim);
        StringBuilder csv = new StringBuilder(
                "id_exame,tipo,situacao,resultado,observacoes,data_solicitacao,data_resultado,"
                        + "id_consulta,id_animal,paciente,veterinario\n");
        for (ExameRelatorioView item : itens) {
            boolean concluido = item.dataResultado() != null
                    && item.resultado() != null
                    && !item.resultado().isBlank();
            appendRow(csv,
                    item.idExame(),
                    item.tipo(),
                    concluido ? "Concluído" : "Pendente",
                    item.resultado(),
                    item.observacoes(),
                    item.dataSolicitacao(),
                    item.dataResultado(),
                    item.idConsulta(),
                    item.idAnimal(),
                    item.paciente(),
                    item.veterinario());
        }
        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    private void validarPeriodo(LocalDate dataInicio, LocalDate dataFim) {
        if (dataInicio != null && dataFim != null && dataInicio.isAfter(dataFim)) {
            throw new IllegalArgumentException("data_inicio não pode ser maior que data_fim.");
        }
    }

    private void appendRow(StringBuilder csv, Object... values) {
        for (int i = 0; i < values.length; i++) {
            if (i > 0) {
                csv.append(',');
            }
            csv.append(escape(values[i]));
        }
        csv.append('\n');
    }

    private String escape(Object value) {
        if (value == null) {
            return "";
        }
        String text = value.toString();
        if (text.contains(",") || text.contains("\"") || text.contains("\n") || text.contains("\r")) {
            return "\"" + text.replace("\"", "\"\"") + "\"";
        }
        return text;
    }
}
