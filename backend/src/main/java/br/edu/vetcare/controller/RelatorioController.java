package br.edu.vetcare.controller;

import java.time.LocalDate;
import java.util.List;

import br.edu.vetcare.dto.relatorio.AgendaDiariaView;
import br.edu.vetcare.dto.relatorio.AgendaPorPeriodoView;
import br.edu.vetcare.dto.relatorio.AtendimentoPorProfissionalView;
import br.edu.vetcare.dto.relatorio.ExameRelatorioView;
import br.edu.vetcare.dto.relatorio.HistoricoClinicoView;
import br.edu.vetcare.dto.relatorio.HistoricoPorPacienteView;
import br.edu.vetcare.dto.relatorio.InternacaoAtivaView;
import br.edu.vetcare.service.RelatorioService;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/relatorios", "/api/relatorios"})
public class RelatorioController {
    private final RelatorioService service;

    public RelatorioController(RelatorioService service) {
        this.service = service;
    }

    @GetMapping("/historico-clinico")
    public List<HistoricoClinicoView> historicoClinico() { return service.historicoClinico(); }

    @GetMapping("/internacoes-ativas")
    public List<InternacaoAtivaView> internacoesAtivas() { return service.internacoesAtivas(); }

    @GetMapping("/agenda-diaria")
    public List<AgendaDiariaView> agendaDiaria() { return service.agendaDiaria(); }

    @GetMapping("/internacoes")
    public List<InternacaoAtivaView> internacoes(
            @RequestParam(name = "data_inicio", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(name = "data_fim", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim) {
        return service.internacoes(dataInicio, dataFim);
    }

    @GetMapping("/agenda")
    public List<AgendaPorPeriodoView> agenda(
            @RequestParam(name = "data_inicio", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(name = "data_fim", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim) {
        return service.agenda(dataInicio, dataFim);
    }

    @GetMapping("/exames")
    public List<ExameRelatorioView> exames(
            @RequestParam(name = "data_inicio", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(name = "data_fim", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim) {
        return service.exames(dataInicio, dataFim);
    }

    @GetMapping("/atendimentos")
    public List<AtendimentoPorProfissionalView> atendimentos(
            @RequestParam(name = "data_inicio", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(name = "data_fim", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim) {
        return service.atendimentos(dataInicio, dataFim);
    }

    @GetMapping("/historico")
    public List<HistoricoPorPacienteView> historico(
            @RequestParam(name = "data_inicio", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(name = "data_fim", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim) {
        return service.historico(dataInicio, dataFim);
    }

    @GetMapping(value = "/atendimentos/csv", produces = "text/csv; charset=UTF-8")
    public ResponseEntity<byte[]> exportarAtendimentosCsv(
            @RequestParam(name = "data_inicio", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(name = "data_fim", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=relatorio-atendimentos.csv")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(service.exportarAtendimentosCsv(dataInicio, dataFim));
    }

    @GetMapping(value = "/historico/csv", produces = "text/csv; charset=UTF-8")
    public ResponseEntity<byte[]> exportarHistoricoCsv(
            @RequestParam(name = "data_inicio", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(name = "data_fim", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=relatorio-historico.csv")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(service.exportarHistoricoCsv(dataInicio, dataFim));
    }

    @GetMapping(value = "/internacoes/csv", produces = "text/csv; charset=UTF-8")
    public ResponseEntity<byte[]> exportarInternacoesCsv(
            @RequestParam(name = "data_inicio", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(name = "data_fim", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=relatorio-internacoes-ativas.csv")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(service.exportarInternacoesCsv(dataInicio, dataFim));
    }

    @GetMapping(value = "/agenda/csv", produces = "text/csv; charset=UTF-8")
    public ResponseEntity<byte[]> exportarAgendaCsv(
            @RequestParam(name = "data_inicio", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(name = "data_fim", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=relatorio-agenda.csv")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(service.exportarAgendaCsv(dataInicio, dataFim));
    }

    @GetMapping(value = "/exames/csv", produces = "text/csv; charset=UTF-8")
    public ResponseEntity<byte[]> exportarExamesCsv(
            @RequestParam(name = "data_inicio", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(name = "data_fim", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=relatorio-exames.csv")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(service.exportarExamesCsv(dataInicio, dataFim));
    }
}
