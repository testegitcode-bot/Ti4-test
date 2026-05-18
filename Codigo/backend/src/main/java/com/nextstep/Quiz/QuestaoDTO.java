package com.nextstep.Quiz;

import java.util.List;

// DTO que representa os dados de uma questão enviados pelo frontend.
// Note que NÃO há o campo "pontos" — o backend calcula automaticamente
// a partir do campo "dificuldade" no QuizService.
public record QuestaoDTO(
        String enunciado,
        Dificuldade dificuldade,
        List<AlternativaDTO> alternativas
) {}
