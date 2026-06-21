package com.nextstep.Artigo;

import java.time.LocalDateTime;

public class ArtigoResponseDTO {

    private Long id;
    private String titulo;
    private String conteudo;
    private String url;
    private String tipoAutor;
    private LocalDateTime dataCriacao;

    private Long professorId;
    private String nomeProfessor;

    private Long alunoId;
    private String nomeAluno;

    private Long turmaId;
    private String nomeTurma;

    public ArtigoResponseDTO(Artigo artigo) {
        this.id = artigo.getId();
        this.titulo = artigo.getTitulo();
        this.conteudo = artigo.getConteudo();
        this.url = artigo.getUrl();
        this.tipoAutor = artigo.getTipoAutor();
        this.dataCriacao = artigo.getDataCriacao();

        if (artigo.getProfessor() != null) {
            this.professorId = artigo.getProfessor().getId();
            this.nomeProfessor = artigo.getProfessor().getNome();
        }

        if (artigo.getAluno() != null) {
            this.alunoId = artigo.getAluno().getId();
            this.nomeAluno = artigo.getAluno().getNome();
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

    public String getUrl() {
        return url;
    }

    public String getTipoAutor() {
        return tipoAutor;
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

    public Long getAlunoId() {
        return alunoId;
    }

    public String getNomeAluno() {
        return nomeAluno;
    }

    public Long getTurmaId() {
        return turmaId;
    }

    public String getNomeTurma() {
        return nomeTurma;
    }
}