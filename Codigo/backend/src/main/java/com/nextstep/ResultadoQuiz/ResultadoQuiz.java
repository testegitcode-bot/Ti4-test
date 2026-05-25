package com.nextstep.ResultadoQuiz;

import java.time.LocalDateTime;

import com.nextstep.Aluno.Aluno;
import com.nextstep.Quiz.Quiz;
import com.nextstep.Turma.Turma;

import jakarta.persistence.*;

@Entity
public class ResultadoQuiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Aluno aluno;

    @ManyToOne
    private Quiz quiz;

    @ManyToOne
    private Turma turma;

    private Integer pontuacao;
    private Integer totalPontos;
    private Double percentual;
    private LocalDateTime dataResposta;

    public ResultadoQuiz() {}

    @PrePersist
    public void prePersist() {
        this.dataResposta = LocalDateTime.now();

        if (totalPontos != null && totalPontos > 0) {
            this.percentual = (pontuacao * 100.0) / totalPontos;
        } else {
            this.percentual = 0.0;
        }
    }

    // getters e setters
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public Aluno getAluno() {
        return aluno;
    }
    public void setAluno(Aluno aluno) {
        this.aluno = aluno;
    }
    public Quiz getQuiz() {
        return quiz;
    }
    public void setQuiz(Quiz quiz) {
        this.quiz = quiz;
    }
    public Turma getTurma() {
        return turma;
    }
    public void setTurma(Turma turma) {
        this.turma = turma;
    }
    public Integer getPontuacao() {
        return pontuacao;
    }
    public void setPontuacao(Integer pontuacao) {
        this.pontuacao = pontuacao;
    }
    public Integer getTotalPontos() {
        return totalPontos;
    }
    public void setTotalPontos(Integer totalPontos) {
        this.totalPontos = totalPontos;
    }
    public Double getPercentual() {
        return percentual;
    }
    public void setPercentual(Double percentual) {
        this.percentual = percentual;
    }

    public LocalDateTime getDataResposta() {
        return dataResposta;
    }

    public void setDataResposta(LocalDateTime dataResposta) {
        this.dataResposta = dataResposta;
    }
}