package com.nextstep.Quiz;

import com.nextstep.Professor.Professor;
import com.nextstep.Professor.ProfessorRepository;
import com.nextstep.Turma.Turma;
import com.nextstep.Turma.TurmaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

// @Service informa ao Spring que esta classe é um componente de serviço.
// O Spring a registra no "container de inversão de controle" (IoC Container),
// permitindo que seja injetada automaticamente onde necessário (@Autowired ou construtor).
// Esta camada contém as REGRAS DE NEGÓCIO — o que fazer com os dados antes de salvar/retornar.
@Service
public class QuizService {

    // Injeção de dependência via construtor:
    // O Spring injeta automaticamente QuizRepository e ProfessorRepository.
    // ProfessorRepository é necessário para buscar o Professor real do banco
    // antes de salvar o Quiz (evita o erro TransientPropertyValueException).
    private final QuizRepository quizRepository;
    private final ProfessorRepository professorRepository;
    private final TurmaRepository turmaRepository;

    public QuizService(
            QuizRepository quizRepository,
            ProfessorRepository professorRepository,
            TurmaRepository turmaRepository
    ) {
        this.quizRepository = quizRepository;
        this.professorRepository = professorRepository;
        this.turmaRepository = turmaRepository;
    }

    // =====================================================================
    // CREATE — Criar um novo quiz completo (com questões e alternativas)
    // =====================================================================
    // @Transactional garante que toda a operação ocorre dentro de uma única
    // transação do banco de dados. Se qualquer passo falhar, tudo é revertido
    // (rollback automático). Também mantém o contexto de persistência ativo,
    // evitando LazyInitializationException ao acessar coleções JPA.
    @Transactional
    public Quiz salvar(QuizRequestDTO dto) {
        // 1. Monta o objeto Quiz com os dados básicos vindos do DTO.
        Quiz quiz = new Quiz();
        quiz.setTitulo(dto.titulo());
        quiz.setDescricao(dto.descricao());
        quiz.setNivelIngles(dto.nivelIngles());
        quiz.setDataCriacao(LocalDateTime.now());

        // 2. Busca o Professor real no banco pelo ID informado no DTO.
        // professorRepository.findById() retorna uma entidade "gerenciada" pelo JPA,
        // evitando o TransientPropertyValueException que ocorria antes.
        Professor professor = professorRepository.findById(dto.professorId())
                .orElseThrow(() -> new RuntimeException(
                        "Professor não encontrado com id: " + dto.professorId()));
        quiz.setProfessor(professor);
        quiz.setTurmas(resolverTurmasObrigatorias(dto.turmaIds(), dto.professorId()));

        // 3. Mapeia a lista de QuestaoDTO para entidades Questao.
        if (dto.questoes() != null) {
            for (QuestaoDTO questaoDTO : dto.questoes()) {
                Questao questao = new Questao();
                questao.setEnunciado(questaoDTO.enunciado());
                questao.setDificuldade(questaoDTO.dificuldade());
                // Liga a questão ao quiz pai (necessário para o JPA preencher quiz_id).
                questao.setQuiz(quiz);
                // Calcula e atribui os pontos a partir da dificuldade.
                aplicarPontosPorDificuldade(questao);

                // 4. Mapeia a lista de AlternativaDTO para entidades Alternativa.
                if (questaoDTO.alternativas() != null) {
                    for (AlternativaDTO alternativaDTO : questaoDTO.alternativas()) {
                        Alternativa alternativa = new Alternativa();
                        alternativa.setTexto(alternativaDTO.texto());
                        alternativa.setCorreta(alternativaDTO.correta());
                        // Liga a alternativa à sua questão pai (preenche questao_id).
                        alternativa.setQuestao(questao);
                        questao.getAlternativas().add(alternativa);
                    }
                }

                // 5. Adiciona a questão à lista do quiz (necessário para o cascade funcionar).
                quiz.getQuestoes().add(questao);
            }
        }

        // Um único save() no Quiz salva em cascata todas as Questoes e Alternativas
        // graças ao CascadeType.ALL configurado nas entidades.
        return quizRepository.save(quiz);
    }

    // =====================================================================
    // READ — Listar todos os quizzes
    // =====================================================================
    public List<Quiz> listarTodos() {
        // findAll() gera: SELECT * FROM quiz (com joins para buscar professor também)
        return quizRepository.findAll();
    }

    // =====================================================================
    // READ — Buscar um quiz específico por ID
    // =====================================================================
    public Optional<Quiz> buscarPorId(Long id) {
        // Optional<Quiz> significa que o resultado pode existir ou não.
        // Evita NullPointerException — quem chama decide o que fazer se não encontrar.
        return quizRepository.findById(id);
    }

    // =====================================================================
    // READ — Listar quizzes criados por um professor específico
    // =====================================================================
    public List<Quiz> listarPorProfessor(Long professorId) {
        // Usa o método customizado definido no Repository.
        // Gerado automaticamente: SELECT * FROM quiz WHERE professor_id = ?
        return quizRepository.findByProfessorId(professorId);
    }

    // =====================================================================
    // UPDATE — Atualizar um quiz existente (substituição completa)
    // =====================================================================
    // @Transactional é OBRIGATÓRIO aqui porque usamos clear() + add() em uma
    // coleção JPA gerenciada. Sem transação ativa, o Hibernate descarregaria
    // a coleção da memória ao final do método, causando LazyInitializationException.
    @Transactional
    public Quiz atualizar(Long id, QuizRequestDTO dto) {
        return quizRepository.findById(id)
                .map(quizExistente -> {
                    quizExistente.setTitulo(dto.titulo());
                    quizExistente.setDescricao(dto.descricao());
                    quizExistente.setNivelIngles(dto.nivelIngles());

                    Professor professor = professorRepository.findById(dto.professorId())
                            .orElseThrow(() -> new RuntimeException(
                                    "Professor não encontrado com id: " + dto.professorId()));
                    quizExistente.setProfessor(professor);
                    quizExistente.setTurmas(resolverTurmasObrigatorias(dto.turmaIds(), dto.professorId()));

                    quizExistente.getQuestoes().clear();

                    if (dto.questoes() != null) {
                        for (QuestaoDTO questaoDTO : dto.questoes()) {
                            Questao questao = new Questao();
                            questao.setEnunciado(questaoDTO.enunciado());
                            questao.setDificuldade(questaoDTO.dificuldade());
                            questao.setQuiz(quizExistente);
                            aplicarPontosPorDificuldade(questao);

                            if (questaoDTO.alternativas() != null) {
                                for (AlternativaDTO alternativaDTO : questaoDTO.alternativas()) {
                                    Alternativa alternativa = new Alternativa();
                                    alternativa.setTexto(alternativaDTO.texto());
                                    alternativa.setCorreta(alternativaDTO.correta());
                                    alternativa.setQuestao(questao);
                                    questao.getAlternativas().add(alternativa);
                                }
                            }
                            quizExistente.getQuestoes().add(questao);
                        }
                    }

                    return quizRepository.save(quizExistente);
                })
                .orElseThrow(() -> new RuntimeException("Quiz não encontrado com id: " + id));
    }

    // =====================================================================
    // DELETE — Deletar um quiz por ID
    // =====================================================================
    public void deletar(Long id) {
        // deleteById() gera: DELETE FROM quiz WHERE id = ?
        // Graças ao cascade e orphanRemoval, o banco também deleta
        // automaticamente todas as Questoes e Alternativas relacionadas.
        quizRepository.deleteById(id);
    }

    // =====================================================================
    // MÉTODO PRIVADO AUXILIAR — Atribuir pontos com base na dificuldade
    // =====================================================================
    // Método privado: só existe dentro desta classe, ninguém de fora chama.
    // É chamado nos métodos salvar() e atualizar() para centralizar a regra:
    // "os pontos nunca são definidos pelo frontend — só pela dificuldade".
    // Isso é uma REGRA DE NEGÓCIO: independente do que o professor envie no JSON,
    // o sistema sempre sobrescreve os pontos pelo valor correto do enum.
    private void aplicarPontosPorDificuldade(Questao questao) {
        if (questao.getDificuldade() != null) {
            // questao.getDificuldade()           → retorna a constante do enum (ex: DIFICIL)
            // .getValorPontos()                  → retorna o int associado (ex: 3)
            // questao.setPontos(...)             → salva esse valor no campo pontos
            questao.setPontos(questao.getDificuldade().getValorPontos());
        }
    }

    private List<Turma> resolverTurmasObrigatorias(List<Long> turmaIds, Long professorId) {
        if (turmaIds == null || turmaIds.isEmpty()) {
            throw new RuntimeException("Selecione ao menos uma turma para o quiz.");
        }

        List<Turma> turmas = new ArrayList<>();
        for (Long turmaId : turmaIds) {
            Turma turma = turmaRepository.findById(turmaId)
                    .orElseThrow(() -> new RuntimeException("Turma não encontrada com id: " + turmaId));

            if (turma.getProfessor() == null || !turma.getProfessor().getId().equals(professorId)) {
                throw new RuntimeException("A turma " + turmaId + " não pertence ao professor informado.");
            }

            turmas.add(turma);
        }

        return turmas;
    }

    public List<Quiz> listarPorTurma(Long idTurma) {
        return quizRepository.buscarPorTurma(idTurma);
    }
}
