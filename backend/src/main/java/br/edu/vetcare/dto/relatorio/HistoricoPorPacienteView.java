package br.edu.vetcare.dto.relatorio;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record HistoricoPorPacienteView(
        Integer idConsulta,
        Integer idAnimal,
        String paciente,
        String especie,
        String raca,
        String sexo,
        BigDecimal peso,
        LocalDate dataNascimento,
        String tutorCpf,
        String tutor,
        String veterinarioCpf,
        String veterinario,
        LocalDateTime dataConsulta,
        String status,
        String observacoes,
        String diagnostico) {
}
