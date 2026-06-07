package com.nextstep.ResultadoQuiz;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

    @GetMapping("/ranking/turma/{idTurma}")
    public List<RankingTurmaDTO> rankingPorTurma(@PathVariable Long idTurma) {
        return service.buscarRankingPorTurma(idTurma);
    }
}