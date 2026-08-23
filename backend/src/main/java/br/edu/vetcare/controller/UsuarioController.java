package br.edu.vetcare.controller;

import java.net.URI;
import java.util.List;

import br.edu.vetcare.dto.usuario.UsuarioRequest;
import br.edu.vetcare.dto.usuario.UsuarioResponse;
import br.edu.vetcare.service.UsuarioService;
import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {
    private final UsuarioService service;
    public UsuarioController(UsuarioService service) { this.service = service; }

    @GetMapping public List<UsuarioResponse> listar() { return service.listar(); }
    @GetMapping("/{cpf}") public UsuarioResponse buscar(@PathVariable String cpf) { return service.buscar(cpf); }
    @PostMapping public ResponseEntity<UsuarioResponse> criar(@Valid @RequestBody UsuarioRequest request) {
        UsuarioResponse response = service.criar(request);
        return ResponseEntity.created(URI.create("/usuarios/" + response.cpf())).body(response);
    }
    @PutMapping("/{cpf}") public UsuarioResponse atualizar(@PathVariable String cpf, @Valid @RequestBody UsuarioRequest request) { return service.atualizar(cpf, request); }
    @DeleteMapping("/{cpf}") public ResponseEntity<Void> excluir(@PathVariable String cpf) { service.excluir(cpf); return ResponseEntity.noContent().build(); }
}
