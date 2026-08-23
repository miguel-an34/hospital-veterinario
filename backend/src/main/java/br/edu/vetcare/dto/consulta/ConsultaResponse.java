package br.edu.vetcare.dto.consulta;

public record ConsultaResponse(
        Integer id,
        String observacoes,
        String status,
        Integer animalId,
        String animal,
        String veterinarioCpf,
        String veterinario,
        Integer agendamentoId) {
}
