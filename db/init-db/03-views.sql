SET NAMES utf8mb4;

-- Visão de histórico clínico
CREATE VIEW v_historico_clinico AS
SELECT 
    a.nome AS paciente,
    a.especie,
    c.data_registro AS data_atendimento,
    c.descricao AS diagnostico,
    u.nome AS veterinario_responsavel
FROM Animal a
JOIN Consulta con ON a.id_animal = con.animal_id
JOIN RegistroClinico c ON con.id_consulta = c.consulta_id
JOIN Funcionario f ON con.veterinario_cpf = f.cpf
JOIN Usuario u ON f.cpf = u.cpf;

-- Visão de internações ativas
CREATE VIEW v_internacoes_ativas AS
SELECT 
    i.leito,
    a.nome AS paciente,
    i.data_entrada,
    u.nome AS tutor_responsavel,
    i.observacoes
FROM Internacao i
JOIN Animal a ON i.animal_id = a.id_animal
JOIN Tutor_Animal ta ON a.id_animal = ta.animal_id
JOIN Usuario u ON ta.tutor_cpf = u.cpf
WHERE i.data_alta IS NULL;

-- Visão da agenda diária
CREATE VIEW v_agenda_diaria AS
SELECT 
    ag.horario,
    ag.motivo,
    a.nome AS paciente,
    u.nome AS tutor
FROM Agendamento ag
JOIN Animal a ON ag.animal_id = a.id_animal
JOIN Usuario u ON ag.tutor_cpf = u.cpf
WHERE ag.data = CURRENT_DATE
ORDER BY ag.horario ASC;