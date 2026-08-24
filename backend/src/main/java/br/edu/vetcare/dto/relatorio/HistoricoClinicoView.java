package br.edu.vetcare.dto.relatorio;

import java.time.LocalDateTime;

public record HistoricoClinicoView(
        String paciente,
        String especie,
        LocalDateTime dataAtendimento,
        String diagnostico,
        String veterinarioResponsavel) {
}
