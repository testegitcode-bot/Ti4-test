package com.nextstep.RespostaArtigo;

import java.time.LocalDateTime;

import com.nextstep.Aluno.Aluno;
import com.nextstep.Artigo.Artigo;

import jakarta.persistence.*;

@Entity
@Table(name = "resposta_artigo")
public class RespostaArtigo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String conteudo;

    private LocalDateTime dataResposta;

    private LocalDateTime dataAvaliacao;

    private Integer nota;

    @ManyToOne
    @JoinColumn(name = "id_artigo", nullable = false)
    private Artigo artigo;

    @ManyToOne
    @JoinColumn(name = "id_aluno", nullable = false)
    private Aluno aluno;

    public RespostaArtigo() {}

    @PrePersist
    public void prePersist() {
        if (dataResposta == null) {
            dataResposta = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public String getConteudo() {
        return conteudo;
    }

    public void setConteudo(String conteudo) {
        this.conteudo = conteudo;
    }

    public LocalDateTime getDataResposta() {
        return dataResposta;
    }

    public void setDataResposta(LocalDateTime dataResposta) {
        this.dataResposta = dataResposta;
    }

    public LocalDateTime getDataAvaliacao() {
        return dataAvaliacao;
    }

    public void setDataAvaliacao(LocalDateTime dataAvaliacao) {
        this.dataAvaliacao = dataAvaliacao;
    }

    public Integer getNota() {
        return nota;
    }

    public void setNota(Integer nota) {
        this.nota = nota;
    }

    public Artigo getArtigo() {
        return artigo;
    }

    public void setArtigo(Artigo artigo) {
        this.artigo = artigo;
    }

    public Aluno getAluno() {
        return aluno;
    }

    public void setAluno(Aluno aluno) {
        this.aluno = aluno;
    }
}