package br.edu.vetcare.service;

import java.util.List;

import br.edu.vetcare.dto.tutor.TutorRequest;
import br.edu.vetcare.dto.tutor.TutorResponse;
import br.edu.vetcare.dto.tutor.TutorSummary;
import br.edu.vetcare.exception.ConflictException;
import br.edu.vetcare.exception.ResourceNotFoundException;
import br.edu.vetcare.repository.TutorRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TutorService {
    private final TutorRepository repository;
    private final PasswordEncoder passwordEncoder;

    public TutorService(TutorRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<TutorSummary> listar() {
        return repository.findAll();
    }

    public TutorResponse buscar(String cpf) {
        return repository.findByCpf(cpf)
                .orElseThrow(() -> new ResourceNotFoundException("Tutor não encontrado."));
    }

    @Transactional
    public TutorResponse criar(TutorRequest request) {
        if (repository.existsUsuario(request.cpf())) {
            throw new ConflictException("Já existe um usuário com este CPF.");
        }
        if (request.senha() == null || request.senha().isBlank()) {
            throw new ConflictException("A senha é obrigatória para um novo tutor.");
        }
        repository.insertUsuario(request, passwordEncoder.encode(request.senha()));
        repository.insertTutor(request.cpf());
        repository.replacePhones(request.cpf(), request.telefones());
        return buscar(request.cpf());
    }

    @Transactional
    public TutorResponse atualizar(String cpf, TutorRequest request) {
        buscar(cpf);
        String senhaHash = request.senha() == null || request.senha().isBlank()
                ? null : passwordEncoder.encode(request.senha());
        repository.updateUsuario(cpf, request, senhaHash);
        repository.replacePhones(cpf, request.telefones());
        return buscar(cpf);
    }

    @Transactional
    public void excluir(String cpf) {
        buscar(cpf);
        repository.deleteUsuario(cpf);
    }
}
