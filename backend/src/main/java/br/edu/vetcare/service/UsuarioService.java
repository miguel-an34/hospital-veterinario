package br.edu.vetcare.service;

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
        if (repository.exists(request.cpf())) throw new ConflictException("Já existe um usuário com este CPF.");
        if (request.senha() == null || request.senha().isBlank()) {
            throw new ConflictException("A senha é obrigatória para um novo usuário.");
        }
        repository.insert(request, passwordEncoder.encode(request.senha()));
        return buscar(request.cpf());
    }

    @Transactional
    public UsuarioResponse atualizar(String cpf, UsuarioRequest request) {
        buscar(cpf);
        String senha = request.senha() == null || request.senha().isBlank()
                ? null : passwordEncoder.encode(request.senha());
        repository.update(cpf, request, senha);
        return buscar(cpf);
    }

    @Transactional
    public void excluir(String cpf) {
        if (repository.delete(cpf) == 0) throw new ResourceNotFoundException("Usuário não encontrado.");
    }
}
