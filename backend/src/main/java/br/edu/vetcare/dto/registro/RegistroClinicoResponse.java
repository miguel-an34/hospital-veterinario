package br.edu.vetcare.dto.registro;

import java.time.LocalDate;

public record RegistroClinicoResponse(
        Integer id,
        String descricao,
        LocalDate dataRegistro,
        Integer consultaId,
        String paciente) {
}
