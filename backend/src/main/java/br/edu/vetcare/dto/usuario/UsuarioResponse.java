package br.edu.vetcare.dto.usuario;

import java.time.LocalDate;
import java.util.List;

public record UsuarioResponse(
        String cpf,
        String nome,
        String email,
        LocalDate dataCadastro,
        String enderecoRua,
        String enderecoNumero,
        String enderecoBairro,
        String enderecoCidade,
        String enderecoCep,
        List<String> telefones,
        boolean tutor,
        boolean funcionario,
        boolean veterinario) {
}
