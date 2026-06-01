package com.nextstep.Quiz;

import java.util.List;

// DTO raiz que o frontend envia no POST /quizzes.
// Contém os dados básicos do Quiz e as listas de questões aninhadas.
// "professorId" substitui o envio da entidade Professor inteira —
// o backend faz o lookup no banco a partir desse ID.
public record QuizRequestDTO(
        String titulo,
        String descricao,
        Long professorId,
        NivelIngles nivelIngles,
        List<Long> turmaIds,
        List<QuestaoDTO> questoes
) {}
