package com.nextstep.ResultadoQuiz;

import java.util.List;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/resultados-quiz")
@CrossOrigin("*")
public class ResultadoQuizController {

    private final ResultadoQuizService service;

    public ResultadoQuizController(ResultadoQuizService service) {
        this.service = service;
    }

    @PostMapping
    public ResultadoQuiz salvar(@RequestBody ResultadoQuizDTO dto) {
        return service.salvar(dto);
    }

    @GetMapping("/turma/{idTurma}")
    public List<ResultadoQuiz> listarPorTurma(@PathVariable Long idTurma) {
        return service.listarPorTurma(idTurma);
    }

    @GetMapping("/quiz/{idQuiz}")
    public List<ResultadoQuiz> listarPorQuiz(@PathVariable Long idQuiz) {
        return service.listarPorQuiz(idQuiz);
    }

    @GetMapping("/aluno/{idAluno}")
    public List<ResultadoQuiz> listarPorAluno(@PathVariable Long idAluno) {
        return service.listarPorAluno(idAluno);
    }
}