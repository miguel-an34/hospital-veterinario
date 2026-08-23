package br.edu.vetcare.controller;

import java.net.URI;
import java.util.List;

import br.edu.vetcare.dto.funcionario.FuncionarioRequest;
import br.edu.vetcare.dto.funcionario.FuncionarioResponse;
import br.edu.vetcare.service.FuncionarioService;
import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/funcionarios")
public class FuncionarioController {
    private final FuncionarioService service;

    public FuncionarioController(FuncionarioService service) {
        this.service = service;
    }

    @GetMapping
    public List<FuncionarioResponse> listar() { return service.listar(); }

    @GetMapping("/{cpf}")
    public FuncionarioResponse buscar(@PathVariable String cpf) { return service.buscar(cpf); }

    @PostMapping
    public ResponseEntity<FuncionarioResponse> criar(@Valid @RequestBody FuncionarioRequest request) {
        FuncionarioResponse response = service.criar(request);
        return ResponseEntity.created(URI.create("/funcionarios/" + response.cpf())).body(response);
    }

    @PutMapping("/{cpf}")
    public FuncionarioResponse atualizar(
            @PathVariable String cpf, @Valid @RequestBody FuncionarioRequest request) {
        return service.atualizar(cpf, request);
    }

    @DeleteMapping("/{cpf}")
    public ResponseEntity<Void> excluir(@PathVariable String cpf) {
        service.excluir(cpf);
        return ResponseEntity.noContent().build();
    }
}
