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

    private LocalDateTime prazoReenvio;

    private String status;

    private Boolean destaque = false;

    @Column(columnDefinition = "TEXT")
    private String feedbackProfessor;

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

        if (status == null) {
            status = "PENDENTE";
        }

        if (destaque == null) {
            destaque = false;
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

    public LocalDateTime getPrazoReenvio() {
        return prazoReenvio;
    }

    public void setPrazoReenvio(LocalDateTime prazoReenvio) {
        this.prazoReenvio = prazoReenvio;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Boolean getDestaque() {
        return destaque;
    }

    public void setDestaque(Boolean destaque) {
        this.destaque = destaque;
    }

    public String getFeedbackProfessor() {
        return feedbackProfessor;
    }

    public void setFeedbackProfessor(String feedbackProfessor) {
        this.feedbackProfessor = feedbackProfessor;
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