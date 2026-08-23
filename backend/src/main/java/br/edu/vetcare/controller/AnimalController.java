package br.edu.vetcare.controller;

import java.net.URI;
import java.util.List;

import br.edu.vetcare.dto.animal.AnimalRequest;
import br.edu.vetcare.dto.animal.AnimalResponse;
import br.edu.vetcare.service.AnimalService;
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
@RequestMapping("/animais")
public class AnimalController {
    private final AnimalService service;

    public AnimalController(AnimalService service) {
        this.service = service;
    }

    @GetMapping
    public List<AnimalResponse> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public AnimalResponse buscar(@PathVariable int id) {
        return service.buscar(id);
    }

    @PostMapping
    public ResponseEntity<AnimalResponse> criar(@Valid @RequestBody AnimalRequest request) {
        AnimalResponse response = service.criar(request);
        return ResponseEntity.created(URI.create("/animais/" + response.id())).body(response);
    }

    @PutMapping("/{id}")
    public AnimalResponse atualizar(@PathVariable int id, @Valid @RequestBody AnimalRequest request) {
        return service.atualizar(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable int id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
