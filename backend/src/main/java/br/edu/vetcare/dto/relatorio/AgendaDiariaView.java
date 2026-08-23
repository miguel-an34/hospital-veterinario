package br.edu.vetcare.dto.relatorio;

import java.time.LocalTime;

public record AgendaDiariaView(
        LocalTime horario,
        String motivo,
        String paciente,
        String tutor) {
}
