package com.nextstep.Artigo;

import java.time.LocalDateTime;

public class ArtigoResponseDTO {

    private Long id;
    private String titulo;
    private String conteudo;
    private LocalDateTime dataCriacao;
    private String tipoAutor;
    private Long autorId;
    private String autorNome;
    private Long turmaId;
    private String turmaNome;

    public ArtigoResponseDTO(Artigo artigo) {
        this.id = artigo.getId();
        this.titulo = artigo.getTitulo();
        this.conteudo = artigo.getConteudo();
        this.dataCriacao = artigo.getDataCriacao();
        this.tipoAutor = artigo.getTipoAutor();

        if (artigo.getAluno() != null) {
            this.autorId = artigo.getAluno().getId();
            this.autorNome = artigo.getAluno().getNome();
        }

        if (artigo.getProfessor() != null) {
            this.autorId = artigo.getProfessor().getId();
            this.autorNome = artigo.getProfessor().getNome();
        }

        if (artigo.getTurma() != null) {
            this.turmaId = artigo.getTurma().getIdTurma();
            this.turmaNome = artigo.getTurma().getNome();
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

    public String getTipoAutor() {
        return tipoAutor;
    }

    public Long getAutorId() {
        return autorId;
    }

    public String getAutorNome() {
        return autorNome;
    }

    public Long getTurmaId() {
        return turmaId;
    }

    public String getTurmaNome() {
        return turmaNome;
    }
}