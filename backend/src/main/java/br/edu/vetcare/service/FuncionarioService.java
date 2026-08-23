package br.edu.vetcare.service;

import java.util.List;

import br.edu.vetcare.dto.funcionario.FuncionarioRequest;
import br.edu.vetcare.dto.funcionario.FuncionarioResponse;
import br.edu.vetcare.exception.ConflictException;
import br.edu.vetcare.exception.ResourceNotFoundException;
import br.edu.vetcare.repository.FuncionarioRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FuncionarioService {
    private final FuncionarioRepository repository;
    private final PasswordEncoder passwordEncoder;

    public FuncionarioService(FuncionarioRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<FuncionarioResponse> listar() {
        return repository.findAll();
    }

    public FuncionarioResponse buscar(String cpf) {
        return repository.findByCpf(cpf)
                .orElseThrow(() -> new ResourceNotFoundException("Funcionário não encontrado."));
    }

    @Transactional
    public FuncionarioResponse criar(FuncionarioRequest request) {
        validarVeterinario(request);
        if (repository.existsUsuario(request.cpf())) {
            throw new ConflictException("Já existe um usuário com este CPF.");
        }
        if (request.senha() == null || request.senha().isBlank()) {
            throw new ConflictException("A senha é obrigatória para um novo funcionário.");
        }
        repository.insertUsuario(request, passwordEncoder.encode(request.senha()));
        repository.insertFuncionario(request);
        repository.replacePhones(request.cpf(), request.telefones());
        if (request.veterinario()) repository.insertVeterinario(request.cpf(), request);
        return buscar(request.cpf());
    }

    @Transactional
    public FuncionarioResponse atualizar(String cpf, FuncionarioRequest request) {
        buscar(cpf);
        validarVeterinario(request);
        String senhaHash = request.senha() == null || request.senha().isBlank()
                ? null : passwordEncoder.encode(request.senha());
        repository.updateUsuario(cpf, request, senhaHash);
        repository.updateFuncionario(cpf, request);
        repository.replacePhones(cpf, request.telefones());

        boolean veterinarioAtual = repository.existsVeterinario(cpf);
        if (request.veterinario() && veterinarioAtual) repository.updateVeterinario(cpf, request);
        else if (request.veterinario()) repository.insertVeterinario(cpf, request);
        else if (veterinarioAtual) repository.deleteVeterinario(cpf);

        return buscar(cpf);
    }

    @Transactional
    public void excluir(String cpf) {
        buscar(cpf);
        repository.deleteUsuario(cpf);
    }

    private void validarVeterinario(FuncionarioRequest request) {
        if (request.veterinario() && (request.crmv() == null || request.crmv().isBlank())) {
            throw new ConflictException("O CRMV é obrigatório para funcionários veterinários.");
        }
    }
}
