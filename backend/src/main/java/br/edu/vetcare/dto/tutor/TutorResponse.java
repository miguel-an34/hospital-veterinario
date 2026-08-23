package br.edu.vetcare.dto.tutor;

import java.time.LocalDate;
import java.util.List;

public record TutorResponse(
        String cpf,
        String nome,
        String email,
        LocalDate dataCadastro,
        String enderecoRua,
        String enderecoNumero,
        String enderecoBairro,
        String enderecoCidade,
        String enderecoCep,
        List<String> telefones) {
}
