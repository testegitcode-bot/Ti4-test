package com.nextstep.Enturmacao;

import com.nextstep.Aluno.Aluno;
import com.nextstep.Turma.Turma;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
public class Enturmacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idEnturmacao;

    private LocalDate dataEnturmacao;

    private String nomeAluno;

    private String nomeTurma;

    @ManyToOne
    @JoinColumn(name = "id_aluno")
    private Aluno aluno;

    @ManyToOne
    @JoinColumn(name = "id_turma")
    private Turma turma;

    public Long getIdEnturmacao() {
        return idEnturmacao;
    }

    public void setIdEnturmacao(Long idEnturmacao) {
        this.idEnturmacao = idEnturmacao;
    }

    public LocalDate getDataEnturmacao() {
        return dataEnturmacao;
    }

    public void setDataEnturmacao(LocalDate dataEnturmacao) {
        this.dataEnturmacao = dataEnturmacao;
    }

    public String getNomeAluno() {
        return nomeAluno;
    }

    public void setNomeAluno(String nomeAluno) {
        this.nomeAluno = nomeAluno;
    }

    public String getNomeTurma() {
        return nomeTurma;
    }

    public void setNomeTurma(String nomeTurma) {
        this.nomeTurma = nomeTurma;
    }

    public Aluno getAluno() {
        return aluno;
    }

    public void setAluno(Aluno aluno) {
        this.aluno = aluno;
    }

    public Turma getTurma() {
        return turma;
    }

    public void setTurma(Turma turma) {
        this.turma = turma;
    }
}