SET NAMES utf8mb4;

-- Visão de histórico clínico
CREATE VIEW v_historico_clinico AS
SELECT 
    a.nome AS paciente,
    a.especie,
    con.data_hora AS data_atendimento,
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

-- Visão analítica de atendimentos por profissional e período
CREATE VIEW v_atendimentos_por_profissional_periodo AS
SELECT
    con.veterinario_cpf,
    u.nome AS profissional,
    YEAR(con.data_hora) AS ano,
    MONTH(con.data_hora) AS mes,
    COUNT(con.id_consulta) AS quantidade_atendimentos,
    CAST(0.00 AS DECIMAL(10,2)) AS faturamento_total
FROM Consulta con
JOIN Veterinario v ON v.cpf = con.veterinario_cpf
JOIN Funcionario f ON f.cpf = v.cpf
JOIN Usuario u ON u.cpf = f.cpf
GROUP BY
    con.veterinario_cpf,
    u.nome,
    YEAR(con.data_hora),
    MONTH(con.data_hora);

-- Visão analítica de histórico consolidado por paciente
CREATE VIEW v_historico_por_paciente AS
SELECT
    con.id_consulta,
    a.id_animal,
    a.nome AS paciente,
    a.especie,
    a.raca,
    a.sexo,
    a.peso,
    a.data_nascimento,
    GROUP_CONCAT(DISTINCT tutor.cpf ORDER BY tutor.cpf SEPARATOR ', ') AS tutor_cpf,
    GROUP_CONCAT(DISTINCT tutor.nome ORDER BY tutor.nome SEPARATOR ', ') AS tutor,
    v.cpf AS veterinario_cpf,
    vet.nome AS veterinario,
    con.data_hora AS data_consulta,
    con.status,
    con.observacoes,
    GROUP_CONCAT(DISTINCT rc.descricao ORDER BY rc.data_registro, rc.id_registro SEPARATOR ' | ') AS diagnostico
FROM Consulta con
JOIN Animal a ON a.id_animal = con.animal_id
JOIN Veterinario v ON v.cpf = con.veterinario_cpf
JOIN Funcionario f ON f.cpf = v.cpf
JOIN Usuario vet ON vet.cpf = f.cpf
LEFT JOIN Tutor_Animal ta ON ta.animal_id = a.id_animal
LEFT JOIN Usuario tutor ON tutor.cpf = ta.tutor_cpf
LEFT JOIN RegistroClinico rc ON rc.consulta_id = con.id_consulta
GROUP BY
    con.id_consulta,
    a.id_animal,
    a.nome,
    a.especie,
    a.raca,
    a.sexo,
    a.peso,
    a.data_nascimento,
    v.cpf,
    vet.nome,
    con.data_hora,
    con.status,
    con.observacoes;
