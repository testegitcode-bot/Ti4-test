package com.nextstep.Ranking;

public class RankingDTO {

    private String nomeAluno;
    private String nomeJogo;
    private Integer maiorPontuacao;

    public RankingDTO(String nomeAluno, String nomeJogo, Integer maiorPontuacao) {
        this.nomeAluno = nomeAluno;
        this.nomeJogo = nomeJogo;
        this.maiorPontuacao = maiorPontuacao;
    }

    public String getNomeAluno() {
        return nomeAluno;
    }

    public String getNomeJogo() {
        return nomeJogo;
    }

    public Integer getMaiorPontuacao() {
        return maiorPontuacao;
    }
}