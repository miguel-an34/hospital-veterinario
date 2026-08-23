package br.edu.vetcare.dto.animal;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonAlias;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AnimalRequest(
        @NotBlank @Size(max = 60) String nome,
        @NotBlank @Size(max = 40) String especie,
        @Size(max = 40) String raca,
        @NotBlank @Pattern(regexp = "[MF]", message = "deve ser M ou F") String sexo,
        @DecimalMin(value = "0.01") @DecimalMax(value = "999.99") BigDecimal peso,
        @JsonAlias("data_nascimento") @PastOrPresent LocalDate dataNascimento,
        @JsonAlias({"tutor_cpf", "tutorCpf"})
        @NotBlank @Pattern(regexp = "\\d{11}", message = "deve conter 11 dígitos") String tutorCpf) {
}
