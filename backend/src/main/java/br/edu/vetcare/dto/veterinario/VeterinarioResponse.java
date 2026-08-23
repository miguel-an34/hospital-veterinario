package br.edu.vetcare.dto.veterinario;

public record VeterinarioResponse(
        String cpf,
        String nome,
        String crmv,
        String especialidade) {
}
