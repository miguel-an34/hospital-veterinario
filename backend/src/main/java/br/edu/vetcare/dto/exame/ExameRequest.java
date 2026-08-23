package br.edu.vetcare.dto.exame;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ExameRequest(
        @NotBlank @Size(max = 60) String tipo,
        @Size(max = 200) String resultado,
        String observacoes,
        LocalDate dataSolicitacao,
        LocalDate dataResultado,
        @NotNull Integer consultaId) {
}
