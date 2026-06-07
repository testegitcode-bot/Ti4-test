package com.nextstep.Artigo;

import java.util.List;

import org.springframework.web.bind.annotation.*;

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

    @GetMapping("/{id}")
    public ArtigoResponseDTO buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @GetMapping("/professor/{professorId}")
    public List<ArtigoResponseDTO> listarPorProfessor(@PathVariable Long professorId) {
        return service.listarPorProfessor(professorId);
    }

    @GetMapping("/turma/{turmaId}")
    public List<ArtigoResponseDTO> listarPorTurma(@PathVariable Long turmaId) {
        return service.listarPorTurma(turmaId);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        service.deletar(id);
    }
}