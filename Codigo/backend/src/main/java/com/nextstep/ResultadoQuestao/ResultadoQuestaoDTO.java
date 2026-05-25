package com.nextstep.ResultadoQuestao;

public class ResultadoQuestaoDTO {
    public record RespostaQuestaoDTO(
    Long questaoId,
    Long alternativaId
) {}
}
