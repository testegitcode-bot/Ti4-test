package com.nextstep.Alocacao;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/alocacoes")
@CrossOrigin("*")
public class AlocacaoController {

    private final AlocacaoService alocacaoService;

    public AlocacaoController(AlocacaoService alocacaoService) {
        this.alocacaoService = alocacaoService;
    }

    @PostMapping
    public Alocacao criar(@RequestBody AlocacaoCadastroDTO dto) {
        return alocacaoService.criar(dto);
    }

    @GetMapping("/{id}")
    public Alocacao buscarPorId(@PathVariable Long id) {
        return alocacaoService.buscarPorId(id);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        alocacaoService.deletar(id);
    }
}