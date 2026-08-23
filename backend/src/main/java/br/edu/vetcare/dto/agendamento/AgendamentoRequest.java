package br.edu.vetcare.dto.agendamento;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AgendamentoRequest(
        @NotNull LocalDate data,
        @NotNull LocalTime horario,
        @NotBlank @Size(max = 200) String motivo,
        @NotBlank @Pattern(regexp = "\\d{11}") String tutorCpf,
        @NotNull Integer animalId) {
}
