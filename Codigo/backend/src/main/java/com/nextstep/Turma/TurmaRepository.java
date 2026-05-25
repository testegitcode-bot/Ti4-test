package com.nextstep.Turma;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TurmaRepository extends JpaRepository<Turma, Long> {

    @Query("""
        SELECT new com.nextstep.Turma.TurmaResumoDTO(
            t.idTurma,
            t.nome,
            t.serie,
            p.nome
        )
        FROM Turma t
        LEFT JOIN t.professor p
        WHERE t.idTurma IN (
            SELECT t2.idTurma
            FROM Turma t2
            JOIN t2.alunos a
            WHERE a.id = :idAluno
        )
    """)
    List<TurmaResumoDTO> buscarTurmasDoAluno(@Param("idAluno") Long idAluno);

    @Modifying
    @Query(value = "DELETE FROM turma_aluno WHERE aluno_id = :idAluno", nativeQuery = true)
    void removerAlunoDasTurmas(@Param("idAluno") Long idAluno);

    @Modifying
    @Query(value = "DELETE FROM enturmacao WHERE id_aluno = :idAluno", nativeQuery = true)
    void removerAlunoDasEnturmacoes(@Param("idAluno") Long idAluno);
}