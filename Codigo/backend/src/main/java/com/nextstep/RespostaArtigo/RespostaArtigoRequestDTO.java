package com.nextstep.RespostaArtigo;

public class RespostaArtigoRequestDTO {

    private String conteudo;
    private Long artigoId;
    private Long alunoId;

    public String getConteudo() {
        return conteudo;
    }

    public void setConteudo(String conteudo) {
        this.conteudo = conteudo;
    }

    public Long getArtigoId() {
        return artigoId;
    }

    public void setArtigoId(Long artigoId) {
        this.artigoId = artigoId;
    }

    public Long getAlunoId() {
        return alunoId;
    }

    public void setAlunoId(Long alunoId) {
        this.alunoId = alunoId;
    }
}