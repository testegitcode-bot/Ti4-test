package com.nextstep.Ranking;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ranking")
@CrossOrigin(origins = "http://localhost:5173")
public class PontuacaoController {

    private final PontuacaoService pontuacaoService;

    public PontuacaoController(PontuacaoService pontuacaoService) {
        this.pontuacaoService = pontuacaoService;
    }

    @PostMapping("/salvar")
    public Pontuacao salvarPontuacao(@RequestBody PontuacaoDTO dto) {
        return pontuacaoService.salvar(dto);
    }

    @GetMapping("/{nomeJogo}")
    public List<RankingDTO> buscarRanking(@PathVariable String nomeJogo) {
        return pontuacaoService.buscarRankingPorJogo(nomeJogo);
    }
}