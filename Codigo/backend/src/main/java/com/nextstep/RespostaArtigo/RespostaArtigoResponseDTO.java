package com.nextstep.RespostaArtigo;

import java.time.LocalDateTime;

public class RespostaArtigoResponseDTO {

    private Long id;

    private String conteudo;

    private String status;

    private Boolean destaque;

    private String feedbackProfessor;

    private LocalDateTime dataResposta;

    private LocalDateTime prazoReenvio;

    private Long artigoId;

    private String tituloArtigo;

    private Long alunoId;

    private String nomeAluno;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getConteudo() {
        return conteudo;
    }

    public void setConteudo(String conteudo) {
        this.conteudo = conteudo;
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

    public LocalDateTime getDataResposta() {
        return dataResposta;
    }

    public void setDataResposta(LocalDateTime dataResposta) {
        this.dataResposta = dataResposta;
    }

    public LocalDateTime getPrazoReenvio() {
        return prazoReenvio;
    }

    public void setPrazoReenvio(LocalDateTime prazoReenvio) {
        this.prazoReenvio = prazoReenvio;
    }

    public Long getArtigoId() {
        return artigoId;
    }

    public void setArtigoId(Long artigoId) {
        this.artigoId = artigoId;
    }

    public String getTituloArtigo() {
        return tituloArtigo;
    }

    public void setTituloArtigo(String tituloArtigo) {
        this.tituloArtigo = tituloArtigo;
    }

    public Long getAlunoId() {
        return alunoId;
    }

    public void setAlunoId(Long alunoId) {
        this.alunoId = alunoId;
    }

    public String getNomeAluno() {
        return nomeAluno;
    }

    public void setNomeAluno(String nomeAluno) {
        this.nomeAluno = nomeAluno;
    }
}