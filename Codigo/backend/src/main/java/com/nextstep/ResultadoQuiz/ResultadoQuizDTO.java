package com.nextstep.ResultadoQuiz;

import java.util.List;

import com.nextstep.ResultadoQuestao.ResultadoQuestaoDTO.RespostaQuestaoDTO;

public record ResultadoQuizDTO(
    Long alunoId,
    Long quizId,
    Long turmaId,
    Integer pontuacao,
    Integer totalPontos,
    List<RespostaQuestaoDTO> respostas
) {}