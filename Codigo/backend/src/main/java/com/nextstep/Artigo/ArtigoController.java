package com.nextstep.Artigo;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/artigos")
@CrossOrigin("*")
public class ArtigoController {

    private final ArtigoService service;

    public ArtigoController(ArtigoService service) {
        this.service = service;
    }

    @PostMapping
    public ArtigoResponseDTO criar(@RequestBody ArtigoRequestDTO dto) {
        return service.criar(dto);
    }

    @GetMapping
    public List<ArtigoResponseDTO> listarTodos() {
        return service.listarTodos();
    }

    @GetMapping("/aluno/{idAluno}")
    public List<ArtigoResponseDTO> listarParaAluno(@PathVariable Long idAluno) {
        return service.listarParaAluno(idAluno);
    }

    @GetMapping("/professor/{idProfessor}")
    public List<ArtigoResponseDTO> listarParaProfessor(
            @PathVariable Long idProfessor,
            @RequestParam(required = false) Long turmaId,
            @RequestParam(required = false) Long alunoId
    ) {
        return service.listarParaProfessor(idProfessor, turmaId, alunoId);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        service.deletar(id);
    }
}