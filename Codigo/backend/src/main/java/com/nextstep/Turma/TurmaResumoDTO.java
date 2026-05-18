package com.nextstep.Turma;

public class TurmaResumoDTO {

    private Long id;
    private String nome;
    private String serie;
    private String professor;

    public TurmaResumoDTO(Long id, String nome, String serie, String professor) {
        this.id = id;
        this.nome = nome;
        this.serie = serie;
        this.professor = professor;
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getSerie() {
        return serie;
    }

    public String getProfessor() {
        return professor;
    }
}