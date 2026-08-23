package br.edu.vetcare.dto.relatorio;

import java.time.LocalDate;

public record HistoricoClinicoView(
        String paciente,
        String especie,
        LocalDate dataAtendimento,
        String diagnostico,
        String veterinarioResponsavel) {
}
