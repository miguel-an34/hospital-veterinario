package br.edu.vetcare.dto.funcionario;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record FuncionarioResponse(
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
        String matricula,
        String cargo,
        BigDecimal salario,
        LocalDate dataAdmissao,
        boolean veterinario,
        String crmv,
        String especialidade) {
}
