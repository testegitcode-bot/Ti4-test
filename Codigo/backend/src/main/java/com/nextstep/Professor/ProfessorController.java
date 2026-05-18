package com.nextstep.Professor;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/professores")
@CrossOrigin("*")
public class ProfessorController {

    private final ProfessorService service;

    public ProfessorController(ProfessorService service) {
        this.service = service;
    }

    // CADASTRO
    @PostMapping("/cadastro")
    public Professor cadastrar(@RequestBody ProfessorCadastroDTO dto) {
        return service.cadastrar(dto);
    }

    // LOGIN
    @PostMapping("/login")
    public Professor login(@RequestBody ProfessorLoginDTO dto) {
        return service.login(dto);
    }

    // LISTAR TODOS
    @GetMapping
    public List<Professor> listar() {
        return service.listarTodos();
    }

    // BUSCAR POR ID
    @GetMapping("/{id}")
    public Professor buscar(@PathVariable Long id) {
        return service.buscarPorId(id)
                .orElseThrow(() -> new RuntimeException("Professor não encontrado"));
    }

    // ATUALIZAR
    @PutMapping("/{id}")
    public Professor atualizar(@PathVariable Long id, @RequestBody ProfessorCadastroDTO dto) {
        return service.atualizar(id, dto);
    }

    // DELETAR
    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        service.deletar(id);
    }
}