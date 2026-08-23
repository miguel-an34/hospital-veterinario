package br.edu.vetcare.controller;

import java.net.URI;
import java.util.List;
import br.edu.vetcare.dto.exame.*;
import br.edu.vetcare.service.AtendimentoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/exames")
public class ExameController {
    private final AtendimentoService service;
    public ExameController(AtendimentoService service) { this.service = service; }
    @GetMapping public List<ExameResponse> listar() { return service.listarExames(); }
    @GetMapping("/{id}") public ExameResponse buscar(@PathVariable int id) { return service.buscarExame(id); }
    @PostMapping public ResponseEntity<ExameResponse> criar(@Valid @RequestBody ExameRequest request) {
        var response = service.criarExame(request);
        return ResponseEntity.created(URI.create("/exames/" + response.id())).body(response);
    }
    @PutMapping("/{id}") public ExameResponse atualizar(@PathVariable int id, @Valid @RequestBody ExameRequest request) { return service.atualizarExame(id, request); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> excluir(@PathVariable int id) { service.excluirExame(id); return ResponseEntity.noContent().build(); }
}
