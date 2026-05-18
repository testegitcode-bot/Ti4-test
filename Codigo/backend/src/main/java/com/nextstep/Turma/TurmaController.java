package com.nextstep.Turma;

import com.nextstep.Aluno.Aluno;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/turmas")
@CrossOrigin("*")
public class TurmaController {

    private final TurmaService service;

    public TurmaController(TurmaService service) {
        this.service = service;
    }

    
    @PostMapping
    public Turma criar(@RequestBody TurmaCadastroDTO dto) {
        return service.criar(dto);
    }

    @GetMapping
    public List<Turma> listar() {
        return service.listarTodas();
    }

    // BuUSCAR POR ID
    @GetMapping("/{id}")
    public Turma buscar(@PathVariable Long id) {
        return service.buscarPorId(id)
                .orElseThrow(() -> new RuntimeException("Turma não encontrada"));
    }

    @PutMapping("/{id}")
    public Turma atualizar(@PathVariable Long id, @RequestBody TurmaCadastroDTO dto) {
        return service.atualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        service.deletar(id);
    }

    // ADICIONAR ALUNO
    @PostMapping("/{idTurma}/alunos")
    public Turma adicionarAluno(@PathVariable Long idTurma, @RequestBody TurmaAlunoDTO dto) {
        return service.adicionarAluno(idTurma, dto.getIdAluno());
    }

    // REMOVER ALUNO
    @DeleteMapping("/{idTurma}/alunos/{idAluno}")
    public Turma removerAluno(@PathVariable Long idTurma, @PathVariable Long idAluno) {
        return service.removerAluno(idTurma, idAluno);
    }

    // LISTAR TODOS ALUNOS DA TURMA
    @GetMapping("/{idTurma}/alunos")
    public List<Aluno> listarAlunos(@PathVariable Long idTurma) {
        return service.listarAlunos(idTurma);
    }
}