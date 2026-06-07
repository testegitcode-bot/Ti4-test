package com.nextstep.Artigo;

import java.time.LocalDateTime;

public class ArtigoResponseDTO {

    private Long id;
    private String titulo;
    private String conteudo;
    private LocalDateTime dataCriacao;

    private Long professorId;
    private String nomeProfessor;

    private Long turmaId;
    private String nomeTurma;

    public ArtigoResponseDTO(Artigo artigo) {
        this.id = artigo.getId();
        this.titulo = artigo.getTitulo();
        this.conteudo = artigo.getConteudo();
        this.dataCriacao = artigo.getDataCriacao();

        if (artigo.getProfessor() != null) {
            this.professorId = artigo.getProfessor().getId();
            this.nomeProfessor = artigo.getProfessor().getNome();
        }

        if (artigo.getTurma() != null) {
            this.turmaId = artigo.getTurma().getIdTurma();
            this.nomeTurma = artigo.getTurma().getNome();
        }
    }

    public Long getId() {
        return id;
    }

    public String getTitulo() {
        return titulo;
    }

    public String getConteudo() {
        return conteudo;
    }

    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }

    public Long getProfessorId() {
        return professorId;
    }

    public String getNomeProfessor() {
        return nomeProfessor;
    }

    public Long getTurmaId() {
        return turmaId;
    }

    public String getNomeTurma() {
        return nomeTurma;
    }
}