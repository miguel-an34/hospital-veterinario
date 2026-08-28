package br.edu.vetcare.dto.relatorio;

import java.time.LocalDate;

public record ExameRelatorioView(
        Integer idExame,
        String tipo,
        String resultado,
        String observacoes,
        LocalDate dataSolicitacao,
        LocalDate dataResultado,
        Integer idConsulta,
        Integer idAnimal,
        String paciente,
        String veterinario) {
}
