package com.nextstep.ResultadoQuiz;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ResultadoQuizRepository extends JpaRepository<ResultadoQuiz, Long> {

    @Query("""
        SELECT new com.nextstep.ResultadoQuiz.RankingTurmaDTO(
            r.aluno.id,
            r.aluno.nome,
            SUM(r.pontuacao),
            COUNT(r.id)
        )
        FROM ResultadoQuiz r
        WHERE r.turma.idTurma = :idTurma
        GROUP BY r.aluno.id, r.aluno.nome
        ORDER BY SUM(r.pontuacao) DESC
    """)
    List<RankingTurmaDTO> buscarRankingPorTurma(@Param("idTurma") Long idTurma);

    List<ResultadoQuiz> findByTurmaIdTurma(Long idTurma);

    List<ResultadoQuiz> findByQuizId(Long idQuiz);

    List<ResultadoQuiz> findByAlunoId(Long idAluno);
}