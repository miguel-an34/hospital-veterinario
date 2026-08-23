package br.edu.vetcare.dto.funcionario;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record FuncionarioRequest(
        @NotBlank @Pattern(regexp = "\\d{11}") String cpf,
        @NotBlank @Size(max = 100) String nome,
        @NotBlank @Email @Size(max = 100) String email,
        @Pattern(regexp = "^$|^.{6,100}$", message = "deve estar vazia ou conter entre 6 e 100 caracteres") String senha,
        @NotBlank @Size(max = 100) String enderecoRua,
        @NotBlank @Size(max = 10) String enderecoNumero,
        @NotBlank @Size(max = 60) String enderecoBairro,
        @NotBlank @Size(max = 60) String enderecoCidade,
        @NotBlank @Size(max = 10) String enderecoCep,
        List<@NotBlank @Size(max = 20) String> telefones,
        @NotBlank @Size(max = 20) String matricula,
        @NotBlank @Size(max = 50) String cargo,
        @NotNull @DecimalMin(value = "0.00") BigDecimal salario,
        @NotNull @PastOrPresent LocalDate dataAdmissao,
        boolean veterinario,
        @Size(max = 20) String crmv,
        @Size(max = 60) String especialidade) {
}
