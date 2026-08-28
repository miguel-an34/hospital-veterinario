-- 04-triggers.sql
SET NAMES utf8mb4;

-- Esse gatilho altera automaticamente o status da tabela Consulta para "Concluída" no exato momento que o veterinário insere as anotações médicas no prontuário.

DELIMITER //

CREATE TRIGGER trg_atualiza_status_consulta
AFTER INSERT ON RegistroClinico
FOR EACH ROW
BEGIN
    UPDATE Consulta
    SET status = 'Concluída'
    WHERE id_consulta = NEW.consulta_id;
END //

DELIMITER ;