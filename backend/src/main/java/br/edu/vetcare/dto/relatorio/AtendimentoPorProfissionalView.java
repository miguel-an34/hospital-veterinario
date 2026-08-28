package br.edu.vetcare.dto.relatorio;

import java.math.BigDecimal;

public record AtendimentoPorProfissionalView(
        String veterinarioCpf,
        String profissional,
        Integer ano,
        Integer mes,
        Long quantidadeAtendimentos,
        BigDecimal faturamentoTotal) {
}
