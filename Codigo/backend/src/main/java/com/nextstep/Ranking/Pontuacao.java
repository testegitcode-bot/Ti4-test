package com.nextstep.Ranking;

import java.time.LocalDateTime;

import com.nextstep.Aluno.Aluno;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "pontuacao")
public class Pontuacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nomeJogo;

    private Integer pontuacao;

    private LocalDateTime dataRegistro;

    @ManyToOne
    @JoinColumn(name = "aluno_id")
    private Aluno aluno;

    public Pontuacao() {
    }

    public Pontuacao(String nomeJogo, Integer pontuacao, Aluno aluno) {
        this.nomeJogo = nomeJogo;
        this.pontuacao = pontuacao;
        this.aluno = aluno;
        this.dataRegistro = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getNomeJogo() {
        return nomeJogo;
    }

    public void setNomeJogo(String nomeJogo) {
        this.nomeJogo = nomeJogo;
    }

    public Integer getPontuacao() {
        return pontuacao;
    }

    public void setPontuacao(Integer pontuacao) {
        this.pontuacao = pontuacao;
    }

    public LocalDateTime getDataRegistro() {
        return dataRegistro;
    }

    public void setDataRegistro(LocalDateTime dataRegistro) {
        this.dataRegistro = dataRegistro;
    }

    public Aluno getAluno() {
        return aluno;
    }

    public void setAluno(Aluno aluno) {
        this.aluno = aluno;
    }
}