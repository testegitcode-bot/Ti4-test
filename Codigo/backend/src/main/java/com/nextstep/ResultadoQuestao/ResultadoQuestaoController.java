package com.nextstep.ResultadoQuestao;

import java.util.List;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/resultado-questao")
@CrossOrigin("*")
public class ResultadoQuestaoController {

    private final ResultadoQuestaoService service;

    public ResultadoQuestaoController(ResultadoQuestaoService service) {
        this.service = service;
    }

    @GetMapping("/resultado/{idResultadoQuiz}")
    public List<ResultadoQuestao> buscarPorResultadoQuiz(
            @PathVariable Long idResultadoQuiz
    ) {
        return service.buscarPorResultadoQuiz(idResultadoQuiz);
    }
}