package com.nextstep.ResultadoQuiz;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ResultadoQuizRepository extends JpaRepository<ResultadoQuiz, Long> {

    List<ResultadoQuiz> findByTurmaIdTurma(Long idTurma);

    List<ResultadoQuiz> findByQuizId(Long idQuiz);

    List<ResultadoQuiz> findByAlunoId(Long idAluno);
}