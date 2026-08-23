package br.edu.vetcare.dto.usuario;

import java.util.List;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UsuarioRequest(
        @NotBlank @Pattern(regexp = "\\d{11}") String cpf,
        @NotBlank @Size(max = 100) String nome,
        @NotBlank @Email @Size(max = 100) String email,
        @Pattern(regexp = "^$|^.{6,100}$", message = "deve estar vazia ou conter entre 6 e 100 caracteres") String senha,
        @NotBlank @Size(max = 100) String enderecoRua,
        @NotBlank @Size(max = 10) String enderecoNumero,
        @NotBlank @Size(max = 60) String enderecoBairro,
        @NotBlank @Size(max = 60) String enderecoCidade,
        @NotBlank @Size(max = 10) String enderecoCep,
        List<@NotBlank @Size(max = 20) String> telefones) {
}
