package br.edu.vetcare.dto.relatorio;

import java.time.LocalDate;

public record InternacaoAtivaView(
        String leito,
        String paciente,
        LocalDate dataEntrada,
        String tutorResponsavel,
        String observacoes) {
}
