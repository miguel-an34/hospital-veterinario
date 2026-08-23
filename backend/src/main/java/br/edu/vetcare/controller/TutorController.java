package br.edu.vetcare.controller;

import java.net.URI;
import java.util.List;

import br.edu.vetcare.dto.tutor.TutorRequest;
import br.edu.vetcare.dto.tutor.TutorResponse;
import br.edu.vetcare.dto.tutor.TutorSummary;
import br.edu.vetcare.service.TutorService;
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
@RequestMapping("/tutores")
public class TutorController {
    private final TutorService service;

    public TutorController(TutorService service) {
        this.service = service;
    }

    @GetMapping
    public List<TutorSummary> listar() { return service.listar(); }

    @GetMapping("/{cpf}")
    public TutorResponse buscar(@PathVariable String cpf) { return service.buscar(cpf); }

    @PostMapping
    public ResponseEntity<TutorResponse> criar(@Valid @RequestBody TutorRequest request) {
        TutorResponse response = service.criar(request);
        return ResponseEntity.created(URI.create("/tutores/" + response.cpf())).body(response);
    }

    @PutMapping("/{cpf}")
    public TutorResponse atualizar(@PathVariable String cpf, @Valid @RequestBody TutorRequest request) {
        return service.atualizar(cpf, request);
    }

    @DeleteMapping("/{cpf}")
    public ResponseEntity<Void> excluir(@PathVariable String cpf) {
        service.excluir(cpf);
        return ResponseEntity.noContent().build();
    }
}
