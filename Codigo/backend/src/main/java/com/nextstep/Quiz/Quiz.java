package com.nextstep.Quiz;

import com.nextstep.Professor.Professor;
import com.nextstep.Turma.Turma;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

// Esta é a entidade raiz do sistema de quizzes.
// Representa um quiz completo criado por um professor,
// como um "jogo" do Kahoot com título, descrição e suas perguntas.
@Entity
@Table(name = "quiz")
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Nome do quiz, ex: "Verbos Irregulares - Nível 1"
    private String titulo;

    // Descrição opcional do quiz, ex: "Quiz para praticar os 20 verbos mais comuns"
    private String descricao;

    @Enumerated(EnumType.STRING)
    private NivelIngles nivelIngles;

    @ManyToOne
    @JoinColumn(name = "professor_id")
    private Professor professor;

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Questao> questoes = new ArrayList<>();

    @ManyToMany
    @JoinTable(
            name = "quiz_turma",
            joinColumns = @JoinColumn(name = "quiz_id"),
            inverseJoinColumns = @JoinColumn(name = "turma_id")
    )
    private List<Turma> turmas = new ArrayList<>();

    // Registra quando o quiz foi criado. Preenchido automaticamente pelo Service.
    private LocalDateTime dataCriacao;

    // Construtor vazio obrigatório pelo JPA.
    public Quiz() {}

    // --- Getters e Setters ---

    public Long getId() {
        return id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public Professor getProfessor() {
        return professor;
    }

    public void setProfessor(Professor professor) {
        this.professor = professor;
    }

    public List<Questao> getQuestoes() {
        return questoes;
    }

    public void setQuestoes(List<Questao> questoes) {
        this.questoes = questoes;
    }

    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }

    public void setDataCriacao(LocalDateTime dataCriacao) {
        this.dataCriacao = dataCriacao;
    }

    public NivelIngles getNivelIngles() {
        return nivelIngles;
    }

    public void setNivelIngles(NivelIngles nivelIngles) {
        this.nivelIngles = nivelIngles;
    }

    public List<Turma> getTurmas() {
        return turmas;
    }

    public void setTurmas(List<Turma> turmas) {
        this.turmas = turmas;
    }
}
