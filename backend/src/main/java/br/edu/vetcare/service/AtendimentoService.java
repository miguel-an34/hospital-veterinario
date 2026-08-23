package br.edu.vetcare.service;

import java.util.List;
import java.util.function.Supplier;

import br.edu.vetcare.dto.agendamento.AgendamentoRequest;
import br.edu.vetcare.dto.agendamento.AgendamentoResponse;
import br.edu.vetcare.dto.consulta.ConsultaRequest;
import br.edu.vetcare.dto.consulta.ConsultaResponse;
import br.edu.vetcare.dto.exame.ExameRequest;
import br.edu.vetcare.dto.exame.ExameResponse;
import br.edu.vetcare.dto.registro.RegistroClinicoRequest;
import br.edu.vetcare.dto.registro.RegistroClinicoResponse;
import br.edu.vetcare.dto.veterinario.VeterinarioResponse;
import br.edu.vetcare.exception.ResourceNotFoundException;
import br.edu.vetcare.repository.AtendimentoRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AtendimentoService {
    private final AtendimentoRepository repository;

    public AtendimentoService(AtendimentoRepository repository) { this.repository = repository; }

    public List<AgendamentoResponse> listarAgendamentos() { return repository.findAllAgendamentos(); }
    public AgendamentoResponse buscarAgendamento(int id) {
        return repository.findAgendamento(id).orElseThrow(notFound("Agendamento"));
    }
    @Transactional public AgendamentoResponse criarAgendamento(AgendamentoRequest request) {
        require("Tutor", "cpf", request.tutorCpf()); require("Animal", "id", request.animalId());
        return buscarAgendamento(repository.insertAgendamento(request));
    }
    @Transactional public AgendamentoResponse atualizarAgendamento(int id, AgendamentoRequest request) {
        buscarAgendamento(id); require("Tutor", "cpf", request.tutorCpf()); require("Animal", "id", request.animalId());
        repository.updateAgendamento(id, request); return buscarAgendamento(id);
    }
    @Transactional public void excluirAgendamento(int id) {
        if (repository.deleteAgendamento(id) == 0) throw notFound("Agendamento").get();
    }

    public List<ConsultaResponse> listarConsultas() { return repository.findAllConsultas(); }
    public ConsultaResponse buscarConsulta(int id) {
        return repository.findConsulta(id).orElseThrow(notFound("Consulta"));
    }
    @Transactional public ConsultaResponse criarConsulta(ConsultaRequest request) {
        validateConsulta(request); return buscarConsulta(repository.insertConsulta(request));
    }
    @Transactional public ConsultaResponse atualizarConsulta(int id, ConsultaRequest request) {
        buscarConsulta(id); validateConsulta(request); repository.updateConsulta(id, request); return buscarConsulta(id);
    }
    @Transactional public void excluirConsulta(int id) {
        if (repository.deleteConsulta(id) == 0) throw notFound("Consulta").get();
    }

    public List<RegistroClinicoResponse> listarRegistros() { return repository.findAllRegistros(); }
    public RegistroClinicoResponse buscarRegistro(int id) {
        return repository.findRegistro(id).orElseThrow(notFound("Registro clínico"));
    }
    @Transactional public RegistroClinicoResponse criarRegistro(RegistroClinicoRequest request) {
        require("Consulta", "id", request.consultaId()); return buscarRegistro(repository.insertRegistro(request));
    }
    @Transactional public RegistroClinicoResponse atualizarRegistro(int id, RegistroClinicoRequest request) {
        buscarRegistro(id); require("Consulta", "id", request.consultaId());
        repository.updateRegistro(id, request); return buscarRegistro(id);
    }
    @Transactional public void excluirRegistro(int id) {
        if (repository.deleteRegistro(id) == 0) throw notFound("Registro clínico").get();
    }

    public List<ExameResponse> listarExames() { return repository.findAllExames(); }
    public ExameResponse buscarExame(int id) { return repository.findExame(id).orElseThrow(notFound("Exame")); }
    @Transactional public ExameResponse criarExame(ExameRequest request) {
        require("Consulta", "id", request.consultaId()); return buscarExame(repository.insertExame(request));
    }
    @Transactional public ExameResponse atualizarExame(int id, ExameRequest request) {
        buscarExame(id); require("Consulta", "id", request.consultaId());
        repository.updateExame(id, request); return buscarExame(id);
    }
    @Transactional public void excluirExame(int id) {
        if (repository.deleteExame(id) == 0) throw notFound("Exame").get();
    }

    public List<VeterinarioResponse> listarVeterinarios() { return repository.findVeterinarios(); }

    private void validateConsulta(ConsultaRequest request) {
        require("Animal", "id", request.animalId());
        require("Veterinario", "cpf", request.veterinarioCpf());
        if (request.agendamentoId() != null) require("Agendamento", "id", request.agendamentoId());
    }

    private void require(String table, String column, Object id) {
        if (!repository.exists(table, column, id)) throw new ResourceNotFoundException(table + " não encontrado.");
    }

    private Supplier<ResourceNotFoundException> notFound(String resource) {
        return () -> new ResourceNotFoundException(resource + " não encontrado.");
    }
}
