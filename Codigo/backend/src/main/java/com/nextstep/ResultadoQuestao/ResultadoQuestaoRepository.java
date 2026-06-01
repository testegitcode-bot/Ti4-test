package com.nextstep.ResultadoQuestao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ResultadoQuestaoRepository
        extends JpaRepository<ResultadoQuestao, Long> {

    List<ResultadoQuestao> findByResultadoQuizId(Long idResultadoQuiz);
}