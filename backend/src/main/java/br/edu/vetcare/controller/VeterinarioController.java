package br.edu.vetcare.controller;

import java.util.List;
import br.edu.vetcare.dto.veterinario.VeterinarioResponse;
import br.edu.vetcare.service.AtendimentoService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController @RequestMapping("/veterinarios")
public class VeterinarioController {
    private final AtendimentoService service;
    public VeterinarioController(AtendimentoService service) { this.service = service; }
    @GetMapping public List<VeterinarioResponse> listar() { return service.listarVeterinarios(); }
}
