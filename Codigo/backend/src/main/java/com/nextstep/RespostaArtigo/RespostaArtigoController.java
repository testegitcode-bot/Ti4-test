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

    @PutMapping("/{id}/nota")
    public RespostaArtigoResponseDTO avaliarComNota(
            @PathVariable Long id,
            @RequestBody RespostaArtigoNotaDTO dto
    ) {
        return service.avaliarComNota(id, dto.getNota());
    }
}