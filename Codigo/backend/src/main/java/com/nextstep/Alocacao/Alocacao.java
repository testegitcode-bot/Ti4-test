package com.nextstep.Alocacao;

import com.nextstep.Professor.Professor;
import com.nextstep.Turma.Turma;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
public class Alocacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idAlocacao;

    private LocalDate dataAlocacao;

    private String nomeTurma;

    @ManyToOne
    @JoinColumn(name = "id_professor")
    private Professor professor;

    @ManyToOne
    @JoinColumn(name = "id_turma")
    private Turma turma;

    public Long getIdAlocacao() {
        return idAlocacao;
    }

    public void setIdAlocacao(Long idAlocacao) {
        this.idAlocacao = idAlocacao;
    }

    public LocalDate getDataAlocacao() {
        return dataAlocacao;
    }

    public void setDataAlocacao(LocalDate dataAlocacao) {
        this.dataAlocacao = dataAlocacao;
    }

    public String getNomeTurma() {
        return nomeTurma;
    }

    public void setNomeTurma(String nomeTurma) {
        this.nomeTurma = nomeTurma;
    }

    public Professor getProfessor() {
        return professor;
    }

    public void setProfessor(Professor professor) {
        this.professor = professor;
    }

    public Turma getTurma() {
        return turma;
    }

    public void setTurma(Turma turma) {
        this.turma = turma;
    }
}