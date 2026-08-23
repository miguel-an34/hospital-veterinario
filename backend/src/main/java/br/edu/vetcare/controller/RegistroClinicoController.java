package br.edu.vetcare.controller;

import java.net.URI;
import java.util.List;
import br.edu.vetcare.dto.registro.*;
import br.edu.vetcare.service.AtendimentoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/registros-clinicos")
public class RegistroClinicoController {
    private final AtendimentoService service;
    public RegistroClinicoController(AtendimentoService service) { this.service = service; }
    @GetMapping public List<RegistroClinicoResponse> listar() { return service.listarRegistros(); }
    @GetMapping("/{id}") public RegistroClinicoResponse buscar(@PathVariable int id) { return service.buscarRegistro(id); }
    @PostMapping public ResponseEntity<RegistroClinicoResponse> criar(@Valid @RequestBody RegistroClinicoRequest request) {
        var response = service.criarRegistro(request);
        return ResponseEntity.created(URI.create("/registros-clinicos/" + response.id())).body(response);
    }
    @PutMapping("/{id}") public RegistroClinicoResponse atualizar(@PathVariable int id, @Valid @RequestBody RegistroClinicoRequest request) { return service.atualizarRegistro(id, request); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> excluir(@PathVariable int id) { service.excluirRegistro(id); return ResponseEntity.noContent().build(); }
}
