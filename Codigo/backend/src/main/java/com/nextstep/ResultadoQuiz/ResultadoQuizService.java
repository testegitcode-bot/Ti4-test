package com.nextstep.ResultadoQuiz;

import java.util.List;

import org.springframework.stereotype.Service;

import com.nextstep.Aluno.AlunoRepository;
import com.nextstep.Quiz.Alternativa;
import com.nextstep.Quiz.AlternativaRepository;
import com.nextstep.Quiz.Questao;
import com.nextstep.Quiz.QuestaoRepository;
import com.nextstep.Quiz.QuizRepository;
import com.nextstep.ResultadoQuestao.ResultadoQuestao;
import com.nextstep.ResultadoQuestao.ResultadoQuestaoDTO.RespostaQuestaoDTO;
import com.nextstep.Turma.TurmaRepository;
import com.nextstep.Quiz.Questao;
import com.nextstep.Quiz.Alternativa;
import com.nextstep.ResultadoQuestao.ResultadoQuestao;
import com.nextstep.ResultadoQuestao.ResultadoQuestaoRepository;

@Service
public class ResultadoQuizService {

    private final ResultadoQuizRepository resultadoRepository;
    private final AlunoRepository alunoRepository;
    private final QuizRepository quizRepository;
    private final TurmaRepository turmaRepository;
    private final ResultadoQuestaoRepository resultadoQuestaoRepository;
    private final QuestaoRepository questaoRepository;
    private final AlternativaRepository alternativaRepository;

    public ResultadoQuizService(
    ResultadoQuizRepository resultadoRepository,
    AlunoRepository alunoRepository,
    QuizRepository quizRepository,
    TurmaRepository turmaRepository,
    QuestaoRepository questaoRepository,
    AlternativaRepository alternativaRepository,
    ResultadoQuestaoRepository resultadoQuestaoRepository
) {
    this.resultadoRepository = resultadoRepository;
    this.alunoRepository = alunoRepository;
    this.quizRepository = quizRepository;
    this.turmaRepository = turmaRepository;

    this.questaoRepository = questaoRepository;
    this.alternativaRepository = alternativaRepository;
    this.resultadoQuestaoRepository = resultadoQuestaoRepository;
}

   public ResultadoQuiz salvar(ResultadoQuizDTO dto) {

    ResultadoQuiz resultado = new ResultadoQuiz();

    resultado.setAluno(
        alunoRepository.findById(dto.alunoId())
            .orElseThrow(() -> new RuntimeException("Aluno não encontrado"))
    );

    resultado.setQuiz(
        quizRepository.findById(dto.quizId())
            .orElseThrow(() -> new RuntimeException("Quiz não encontrado"))
    );

    resultado.setTurma(
        turmaRepository.findById(dto.turmaId())
            .orElseThrow(() -> new RuntimeException("Turma não encontrada"))
    );

    resultado.setPontuacao(dto.pontuacao());
    resultado.setTotalPontos(dto.totalPontos());

    ResultadoQuiz resultadoSalvo = resultadoRepository.save(resultado);

    if (dto.respostas() != null) {

        for (RespostaQuestaoDTO respostaDTO : dto.respostas()) {

            Questao questao = questaoRepository
                .findById(respostaDTO.questaoId())
                .orElseThrow(() ->
                    new RuntimeException("Questão não encontrada")
                );

            Alternativa alternativa = alternativaRepository
                .findById(respostaDTO.alternativaId())
                .orElseThrow(() ->
                    new RuntimeException("Alternativa não encontrada")
                );

            ResultadoQuestao resultadoQuestao =
                new ResultadoQuestao();

            resultadoQuestao.setResultadoQuiz(resultadoSalvo);

            resultadoQuestao.setQuestao(questao);

            resultadoQuestao.setAlternativaSelecionada(
                alternativa
            );

            resultadoQuestao.setCorreta(
                alternativa.getCorreta()
            );

            resultadoQuestaoRepository.save(
                resultadoQuestao
            );
        }
    }

        return resultadoSalvo;
    }
    public List<ResultadoQuiz> listarPorTurma(Long idTurma) {
        return resultadoRepository.findByTurmaIdTurma(idTurma);
    }

    public List<ResultadoQuiz> listarPorQuiz(Long idQuiz) {
        return resultadoRepository.findByQuizId(idQuiz);
    }

    public List<ResultadoQuiz> listarPorAluno(Long idAluno) {
        return resultadoRepository.findByAlunoId(idAluno);
    }
}