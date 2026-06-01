package com.nextstep.Resenha;

public class ResenhaRequestDTO {

    private String conteudo;
    private Long autorId;
    private String autorNome;

    public ResenhaRequestDTO() {}

    public String getConteudo() { return conteudo; }
    public void setConteudo(String conteudo) { this.conteudo = conteudo; }

    public Long getAutorId() { return autorId; }
    public void setAutorId(Long autorId) { this.autorId = autorId; }

    public String getAutorNome() { return autorNome; }
    public void setAutorNome(String autorNome) { this.autorNome = autorNome; }
}
