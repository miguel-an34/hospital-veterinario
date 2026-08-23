package br.edu.vetcare.dto.registro;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RegistroClinicoRequest(
        @NotBlank String descricao,
        LocalDate dataRegistro,
        @NotNull Integer consultaId) {
}
