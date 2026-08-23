package br.edu.vetcare.service;

import java.util.List;

import br.edu.vetcare.dto.animal.AnimalRequest;
import br.edu.vetcare.dto.animal.AnimalResponse;
import br.edu.vetcare.exception.ResourceNotFoundException;
import br.edu.vetcare.repository.AnimalRepository;
import br.edu.vetcare.repository.TutorRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AnimalService {
    private final AnimalRepository animalRepository;
    private final TutorRepository tutorRepository;

    public AnimalService(AnimalRepository animalRepository, TutorRepository tutorRepository) {
        this.animalRepository = animalRepository;
        this.tutorRepository = tutorRepository;
    }

    public List<AnimalResponse> listar() {
        return animalRepository.findAll();
    }

    public AnimalResponse buscar(int id) {
        return animalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Animal não encontrado."));
    }

    @Transactional
    public AnimalResponse criar(AnimalRequest request) {
        validarTutor(request.tutorCpf());
        int id = animalRepository.insert(request);
        animalRepository.replaceTutor(id, request.tutorCpf());
        return buscar(id);
    }

    @Transactional
    public AnimalResponse atualizar(int id, AnimalRequest request) {
        buscar(id);
        validarTutor(request.tutorCpf());
        animalRepository.update(id, request);
        animalRepository.replaceTutor(id, request.tutorCpf());
        return buscar(id);
    }

    @Transactional
    public void excluir(int id) {
        if (animalRepository.delete(id) == 0) {
            throw new ResourceNotFoundException("Animal não encontrado.");
        }
    }

    private void validarTutor(String cpf) {
        if (!tutorRepository.existsByCpf(cpf)) {
            throw new ResourceNotFoundException("Tutor não encontrado.");
        }
    }
}
