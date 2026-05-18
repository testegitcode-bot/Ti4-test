package com.nextstep.Enturmacao;

import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/enturmacoes")
@CrossOrigin("*")
public class EnturmacaoController {

    private final EnturmacaoService enturmacaoService;

    public EnturmacaoController(EnturmacaoService enturmacaoService) {
        this.enturmacaoService = enturmacaoService;
    }

    @PostMapping
    public Enturmacao criar(@RequestBody EnturmacaoCadastroDTO dto) {
        return enturmacaoService.criar(dto);
    }
}