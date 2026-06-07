package com.nextstep.Ranking;

public class RankingGlobalDTO {

    private String nomeAluno;
    private Long pontuacaoTotal;
    private Long jogosRegistrados;

    public RankingGlobalDTO(String nomeAluno, Long pontuacaoTotal, Long jogosRegistrados) {
        this.nomeAluno = nomeAluno;
        this.pontuacaoTotal = pontuacaoTotal;
        this.jogosRegistrados = jogosRegistrados;
    }

    public String getNomeAluno() {
        return nomeAluno;
    }

    public Long getPontuacaoTotal() {
        return pontuacaoTotal;
    }

    public Long getJogosRegistrados() {
        return jogosRegistrados;
    }
}