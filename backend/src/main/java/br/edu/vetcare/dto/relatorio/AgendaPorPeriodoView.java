package br.edu.vetcare.dto.relatorio;

import java.time.LocalDate;
import java.time.LocalTime;

public record AgendaPorPeriodoView(
        Integer idAgendamento,
        LocalDate data,
        LocalTime horario,
        String motivo,
        Integer idAnimal,
        String paciente,
        String tutorCpf,
        String tutor) {
}
