package com.nextstep.ResultadoQuestao;

import com.nextstep.Quiz.Alternativa;
import com.nextstep.Quiz.Questao;
import com.nextstep.ResultadoQuiz.ResultadoQuiz;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

@Entity
public class ResultadoQuestao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private ResultadoQuiz resultadoQuiz;

    @ManyToOne
    private Questao questao;

    @ManyToOne
    private Alternativa alternativaSelecionada;

    private Boolean correta;

    // getters e setters

    public ResultadoQuiz getResultadoQuiz() {
        return resultadoQuiz;
    }

    public void setResultadoQuiz(ResultadoQuiz resultadoQuiz) {
        this.resultadoQuiz = resultadoQuiz;
    }

    public Questao getQuestao() {
        return questao;
    }

    public void setQuestao(Questao questao) {
        this.questao = questao;
    }

    public Alternativa getAlternativaSelecionada() {
        return alternativaSelecionada;
    }

    public void setAlternativaSelecionada(Alternativa alternativaSelecionada) {
        this.alternativaSelecionada = alternativaSelecionada;
    }

    public Boolean getCorreta() {
        return correta;
    }

    public void setCorreta(Boolean correta) {
        this.correta = correta;
    }
}
