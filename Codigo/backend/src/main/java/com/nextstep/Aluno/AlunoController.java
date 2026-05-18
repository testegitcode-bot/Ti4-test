package com.nextstep.Aluno;

import org.springframework.web.bind.annotation.*;
import com.nextstep.Turma.TurmaResumoDTO;
import java.util.List;

@RestController
@RequestMapping("/alunos")
@CrossOrigin("*")
public class AlunoController {

    private final AlunoService service;

    public AlunoController(AlunoService service) {
        this.service = service;
    }

    @PostMapping("/cadastro")
    public Aluno cadastrar(@RequestBody AlunoCadastroDTO dto) {
        return service.cadastrar(dto);
    }

    @PostMapping("/login")
    public Aluno login(@RequestBody AlunoLoginDTO dto) {
        return service.login(dto);
    }

    @GetMapping
    public List<Aluno> listar() {
        return service.listarTodos();
    }

    @GetMapping("/{id}")
    public Aluno buscar(@PathVariable Long id) {
        return service.buscarPorId(id)
                .orElseThrow(() -> new RuntimeException("Aluno não encontrado"));
    }

    @GetMapping("/{id}/turmas")
    public List<TurmaResumoDTO> listarTurmasDoAluno(@PathVariable Long id) {
        return service.listarTurmasDoAluno(id);
    }   

    @PutMapping("/{id}")
    public Aluno atualizar(@PathVariable Long id, @RequestBody AlunoCadastroDTO dto) {
        return service.atualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        service.deletar(id);
    }
}