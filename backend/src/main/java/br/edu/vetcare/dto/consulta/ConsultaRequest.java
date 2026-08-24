package br.edu.vetcare.dto.consulta;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ConsultaRequest(
        @NotNull LocalDateTime dataHora,
        String observacoes,
        @NotBlank @Size(max = 20) String status,
        @NotNull Integer animalId,
        @NotBlank @Pattern(regexp = "\\d{11}") String veterinarioCpf,
        Integer agendamentoId) {
}
