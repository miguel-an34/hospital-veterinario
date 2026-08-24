package br.edu.vetcare.dto.consulta;

import java.time.LocalDateTime;

public record ConsultaResponse(
        Integer id,
        LocalDateTime dataHora,
        String observacoes,
        String status,
        Integer animalId,
        String animal,
        String veterinarioCpf,
        String veterinario,
        Integer agendamentoId) {
}
