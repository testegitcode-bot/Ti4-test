package com.nextstep.Ranking;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

    @GetMapping("/global")
    public List<RankingGlobalDTO> buscarRankingGlobal() {
        return pontuacaoService.buscarRankingGlobal();
    }
}