package com.nextstep.Resenha;

import java.time.LocalDateTime;

public class ResenhaResponseDTO {

    private Long id;
    private String conteudo;
    private LocalDateTime dataCriacao;
    private Long autorId;
    private String autorNome;
    private Long artigoId;

    public ResenhaResponseDTO(Resenha resenha) {
        this.id = resenha.getId();
        this.conteudo = resenha.getConteudo();
        this.dataCriacao = resenha.getDataCriacao();
        this.autorId = resenha.getAutorId();
        this.autorNome = resenha.getAutorNome();
        this.artigoId = resenha.getArtigo() != null ? resenha.getArtigo().getId() : null;
    }

    public Long getId() { return id; }
    public String getConteudo() { return conteudo; }
    public LocalDateTime getDataCriacao() { return dataCriacao; }
    public Long getAutorId() { return autorId; }
    public String getAutorNome() { return autorNome; }
    public Long getArtigoId() { return artigoId; }
}
