package com.nextstep.ResultadoQuestao;

import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class ResultadoQuestaoService {

    private final ResultadoQuestaoRepository repository;

    public ResultadoQuestaoService(ResultadoQuestaoRepository repository) {
        this.repository = repository;
    }

    public List<ResultadoQuestao> buscarPorResultadoQuiz(Long idResultadoQuiz) {
        return repository.findByResultadoQuizId(idResultadoQuiz);
    }
}