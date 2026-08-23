package br.edu.vetcare.service;

import java.math.BigDecimal;
import java.util.List;

import br.edu.vetcare.dto.usuario.UsuarioRequest;
import br.edu.vetcare.dto.usuario.UsuarioResponse;
import br.edu.vetcare.exception.ConflictException;
import br.edu.vetcare.exception.ResourceNotFoundException;
import br.edu.vetcare.repository.UsuarioRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UsuarioService {
    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UsuarioResponse> listar() { return repository.findAll(); }

    public UsuarioResponse buscar(String cpf) {
        return repository.findByCpf(cpf).orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));
    }

    @Transactional
    public UsuarioResponse criar(UsuarioRequest request) {
        validarPerfis(request);
        if (repository.exists(request.cpf())) throw new ConflictException("Já existe um usuário com este CPF.");
        if (request.senha() == null || request.senha().isBlank()) {
            throw new ConflictException("A senha é obrigatória para um novo usuário.");
        }
        repository.insert(request, passwordEncoder.encode(request.senha()));
        sincronizarPerfis(request.cpf(), request, null);
        return buscar(request.cpf());
    }

    @Transactional
    public UsuarioResponse atualizar(String cpf, UsuarioRequest request) {
        UsuarioResponse atual = buscar(cpf);
        validarPerfis(request);
        String senha = request.senha() == null || request.senha().isBlank()
                ? null : passwordEncoder.encode(request.senha());
        repository.update(cpf, request, senha);
        sincronizarPerfis(cpf, request, atual);
        return buscar(cpf);
    }

    @Transactional
    public void excluir(String cpf) {
        if (repository.delete(cpf) == 0) throw new ResourceNotFoundException("Usuário não encontrado.");
    }

    private void sincronizarPerfis(String cpf, UsuarioRequest request, UsuarioResponse atual) {
        boolean tutorAtual = atual != null && atual.tutor();
        if (request.tutor() && !tutorAtual) repository.insertTutor(cpf);
        else if (!request.tutor() && tutorAtual) repository.deleteTutor(cpf);

        boolean funcionarioAtual = atual != null && atual.funcionario();
        boolean veterinarioAtual = atual != null && atual.veterinario();
        if (request.funcionario()) {
            if (funcionarioAtual) repository.updateFuncionario(cpf, request);
            else repository.insertFuncionario(cpf, request);

            if (request.veterinario() && veterinarioAtual) repository.updateVeterinario(cpf, request);
            else if (request.veterinario()) repository.insertVeterinario(cpf, request);
            else if (veterinarioAtual) repository.deleteVeterinario(cpf);
        } else if (funcionarioAtual) {
            repository.deleteFuncionario(cpf);
        }
    }

    private void validarPerfis(UsuarioRequest request) {
        if (!request.tutor() && !request.funcionario()) {
            throw new ConflictException("Selecione ao menos um perfil: tutor ou funcionário.");
        }
        if (request.veterinario() && !request.funcionario()) {
            throw new ConflictException("Todo veterinário deve possuir também o perfil de funcionário.");
        }
        if (!request.funcionario()) return;
        if (isBlank(request.matricula()) || isBlank(request.cargo())
                || request.salario() == null || request.dataAdmissao() == null) {
            throw new ConflictException("Matrícula, cargo, salário e data de admissão são obrigatórios para funcionários.");
        }
        if (request.salario().compareTo(BigDecimal.ZERO) < 0) {
            throw new ConflictException("O salário do funcionário não pode ser negativo.");
        }
        if (request.veterinario() && isBlank(request.crmv())) {
            throw new ConflictException("O CRMV é obrigatório para funcionários veterinários.");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
