package br.edu.vetcare.dto.relatorio;

import java.time.LocalDateTime;

public record InternacaoAtivaView(
        String leito,
        String paciente,
        LocalDateTime dataEntrada,
        String tutorResponsavel,
        String observacoes) {
}
