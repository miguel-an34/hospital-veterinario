package br.edu.vetcare.controller;

import java.net.URI;
import java.util.List;
import br.edu.vetcare.dto.agendamento.*;
import br.edu.vetcare.service.AtendimentoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/agendamentos")
public class AgendamentoController {
    private final AtendimentoService service;
    public AgendamentoController(AtendimentoService service) { this.service = service; }
    @GetMapping public List<AgendamentoResponse> listar() { return service.listarAgendamentos(); }
    @GetMapping("/{id}") public AgendamentoResponse buscar(@PathVariable int id) { return service.buscarAgendamento(id); }
    @PostMapping public ResponseEntity<AgendamentoResponse> criar(@Valid @RequestBody AgendamentoRequest request) {
        var response = service.criarAgendamento(request);
        return ResponseEntity.created(URI.create("/agendamentos/" + response.id())).body(response);
    }
    @PutMapping("/{id}") public AgendamentoResponse atualizar(@PathVariable int id, @Valid @RequestBody AgendamentoRequest request) { return service.atualizarAgendamento(id, request); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> excluir(@PathVariable int id) { service.excluirAgendamento(id); return ResponseEntity.noContent().build(); }
}
