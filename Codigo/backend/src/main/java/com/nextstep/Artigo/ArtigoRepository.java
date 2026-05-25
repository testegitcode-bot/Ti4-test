    package com.nextstep.Artigo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ArtigoRepository extends JpaRepository<Artigo, Long> {

    List<Artigo> findAllByOrderByDataCriacaoDesc();

    @Query("""
        SELECT a FROM Artigo a
        LEFT JOIN a.turma t
        LEFT JOIN t.professor tp
        LEFT JOIN a.professor p
        LEFT JOIN a.aluno al
        WHERE
            (:idProfessor IS NULL OR tp.id = :idProfessor OR p.id = :idProfessor)
            AND (:idTurma IS NULL OR t.idTurma = :idTurma)
            AND (:idAluno IS NULL OR al.id = :idAluno)
        ORDER BY a.dataCriacao DESC
    """)
    List<Artigo> filtrarProfessor(
            @Param("idProfessor") Long idProfessor,
            @Param("idTurma") Long idTurma,
            @Param("idAluno") Long idAluno
    );
}