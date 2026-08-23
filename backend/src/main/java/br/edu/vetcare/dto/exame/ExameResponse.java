package br.edu.vetcare.dto.exame;

import java.time.LocalDate;

public record ExameResponse(
        Integer id,
        String tipo,
        String resultado,
        String observacoes,
        LocalDate dataSolicitacao,
        LocalDate dataResultado,
        Integer consultaId,
        String paciente) {
}
