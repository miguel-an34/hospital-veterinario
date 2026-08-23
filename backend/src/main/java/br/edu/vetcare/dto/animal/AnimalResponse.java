package br.edu.vetcare.dto.animal;

import java.math.BigDecimal;
import java.time.LocalDate;

public record AnimalResponse(
        Integer id,
        String nome,
        String especie,
        String raca,
        String sexo,
        BigDecimal peso,
        LocalDate dataNascimento,
        String tutorCpf,
        String tutor) {
}
