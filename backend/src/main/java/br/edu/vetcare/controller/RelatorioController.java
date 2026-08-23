package br.edu.vetcare.controller;

import java.util.List;

import br.edu.vetcare.dto.relatorio.AgendaDiariaView;
import br.edu.vetcare.dto.relatorio.HistoricoClinicoView;
import br.edu.vetcare.dto.relatorio.InternacaoAtivaView;
import br.edu.vetcare.repository.RelatorioRepository;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/relatorios")
public class RelatorioController {
    private final RelatorioRepository repository;

    public RelatorioController(RelatorioRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/historico-clinico")
    public List<HistoricoClinicoView> historicoClinico() { return repository.historicoClinico(); }

    @GetMapping("/internacoes-ativas")
    public List<InternacaoAtivaView> internacoesAtivas() { return repository.internacoesAtivas(); }

    @GetMapping("/agenda-diaria")
    public List<AgendaDiariaView> agendaDiaria() { return repository.agendaDiaria(); }
}
