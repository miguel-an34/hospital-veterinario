package br.edu.vetcare.dto.agendamento;

import java.time.LocalDate;
import java.time.LocalTime;

public record AgendamentoResponse(
        Integer id,
        LocalDate data,
        LocalTime horario,
        String motivo,
        String tutorCpf,
        String tutor,
        Integer animalId,
        String animal) {
}
