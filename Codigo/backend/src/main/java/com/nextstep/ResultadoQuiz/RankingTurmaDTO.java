package com.nextstep.ResultadoQuiz;

public class RankingTurmaDTO {

    private Long idAluno;
    private String nomeAluno;
    private Long pontuacaoTotal;
    private Long quizzesRespondidos;

    public RankingTurmaDTO(Long idAluno, String nomeAluno, Long pontuacaoTotal, Long quizzesRespondidos) {
        this.idAluno = idAluno;
        this.nomeAluno = nomeAluno;
        this.pontuacaoTotal = pontuacaoTotal;
        this.quizzesRespondidos = quizzesRespondidos;
    }

    public Long getIdAluno() {
        return idAluno;
    }

    public String getNomeAluno() {
        return nomeAluno;
    }

    public Long getPontuacaoTotal() {
        return pontuacaoTotal;
    }

    public Long getQuizzesRespondidos() {
        return quizzesRespondidos;
    }
}