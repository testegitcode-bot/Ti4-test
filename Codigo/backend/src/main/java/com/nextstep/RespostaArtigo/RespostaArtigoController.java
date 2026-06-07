package com.nextstep.RespostaArtigo;

import java.util.List;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/respostas-artigo")
@CrossOrigin("*")
public class RespostaArtigoController {

    private final RespostaArtigoService service;

    public RespostaArtigoController(RespostaArtigoService service) {
        this.service = service;
    }

    @PostMapping
    public RespostaArtigoResponseDTO responder(@RequestBody RespostaArtigoRequestDTO dto) {
        return service.responder(dto);
    }

    @GetMapping("/artigo/{artigoId}")
    public List<RespostaArtigoResponseDTO> listarPorArtigo(@PathVariable Long artigoId) {
        return service.listarPorArtigo(artigoId);
    }

    @GetMapping("/aluno/{alunoId}")
    public List<RespostaArtigoResponseDTO> listarPorAluno(@PathVariable Long alunoId) {
        return service.listarPorAluno(alunoId);
    }

    @GetMapping("/pendentes")
    public List<RespostaArtigoResponseDTO> listarPendentes() {
        return service.listarPendentes();
    }

    @GetMapping("/destaques")
    public List<RespostaArtigoResponseDTO> listarDestaques() {
        return service.listarDestaques();
    }

    @PutMapping("/{id}/aprovar")
    public RespostaArtigoResponseDTO aprovar(
            @PathVariable Long id,
            @RequestBody RespostaArtigoAprovacaoDTO dto
    ) {
        return service.aprovar(id, dto.getDestaque());
    }

    @PutMapping("/{id}/reprovar")
    public RespostaArtigoResponseDTO reprovar(
            @PathVariable Long id,
            @RequestBody RespostaArtigoFeedbackDTO dto
    ) {
        return service.reprovar(id, dto.getFeedback());
    }

    @PutMapping("/{id}/reenviar")
    public RespostaArtigoResponseDTO reenviar(
            @PathVariable Long id,
            @RequestBody RespostaArtigoReenvioDTO dto
    ) {
        return service.reenviar(id, dto.getConteudo());
    }
}