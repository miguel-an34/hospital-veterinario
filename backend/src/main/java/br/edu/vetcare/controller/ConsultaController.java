package br.edu.vetcare.controller;

import java.net.URI;
import java.util.List;
import br.edu.vetcare.dto.consulta.*;
import br.edu.vetcare.service.AtendimentoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/consultas")
public class ConsultaController {
    private final AtendimentoService service;
    public ConsultaController(AtendimentoService service) { this.service = service; }
    @GetMapping public List<ConsultaResponse> listar() { return service.listarConsultas(); }
    @GetMapping("/{id}") public ConsultaResponse buscar(@PathVariable int id) { return service.buscarConsulta(id); }
    @PostMapping public ResponseEntity<ConsultaResponse> criar(@Valid @RequestBody ConsultaRequest request) {
        var response = service.criarConsulta(request);
        return ResponseEntity.created(URI.create("/consultas/" + response.id())).body(response);
    }
    @PutMapping("/{id}") public ConsultaResponse atualizar(@PathVariable int id, @Valid @RequestBody ConsultaRequest request) { return service.atualizarConsulta(id, request); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> excluir(@PathVariable int id) { service.excluirConsulta(id); return ResponseEntity.noContent().build(); }
}
