package com.nextstep.Turma;

import com.nextstep.Alocacao.AlocacaoCadastroDTO;
import com.nextstep.Alocacao.AlocacaoService;
import com.nextstep.Aluno.Aluno;
import com.nextstep.Aluno.AlunoRepository;
import com.nextstep.Enturmacao.EnturmacaoCadastroDTO;
import com.nextstep.Professor.ProfessorRepository;
import com.nextstep.Professor.Professor;
import com.nextstep.Enturmacao.EnturmacaoService;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TurmaService {

    private final TurmaRepository turmaRepository;
    private final AlunoRepository alunoRepository;
    private final ProfessorRepository professorRepository;
    private final AlocacaoService alocacaoService;
    private final EnturmacaoService enturmacaoService;
    
    public TurmaService(
        TurmaRepository turmaRepository,
        AlunoRepository alunoRepository,
        ProfessorRepository professorRepository,
        AlocacaoService alocacaoService,
        EnturmacaoService enturmacaoService
    ) {
        this.turmaRepository = turmaRepository;
        this.alunoRepository = alunoRepository;
        this.professorRepository = professorRepository;
        this.alocacaoService = alocacaoService;
        this.enturmacaoService = enturmacaoService;
    }

    public Turma criar(TurmaCadastroDTO dto) {
    Professor professor = professorRepository.findById(dto.getIdProfessor())
            .orElseThrow(() -> new RuntimeException("Professor não encontrado"));

    Turma turma = new Turma();

        turma.setNome(dto.getNome());
        turma.setSerie(dto.getSerie());
        turma.setProfessor(professor);

        // salva turma primeiro
        Turma turmaSalva = turmaRepository.save(turma);

        // cria registro da alocação
        AlocacaoCadastroDTO alocacaoDTO = new AlocacaoCadastroDTO();

        alocacaoDTO.setIdProfessor(professor.getId());
        alocacaoDTO.setIdTurma(turmaSalva.getIdTurma());

        alocacaoService.criar(alocacaoDTO);

        return turmaSalva;
    }

    public List<Turma> listarTodas() {
        return turmaRepository.findAll();
    }

    public Optional<Turma> buscarPorId(Long id) {
        return turmaRepository.findById(id);
    }

    public Turma atualizar(Long id, TurmaCadastroDTO dto) {
        return turmaRepository.findById(id)
                .map(turma -> {
                    turma.setNome(dto.getNome());
                    turma.setSerie(dto.getSerie());
                    return turmaRepository.save(turma);
                })
                .orElseThrow(() -> new RuntimeException("Turma não encontrada"));
    }

    public void deletar(Long id) {
        turmaRepository.deleteById(id);
    }

    public Turma adicionarAluno(Long idTurma, Long idAluno) {
        Turma turma = turmaRepository.findById(idTurma)
                .orElseThrow(() -> new RuntimeException("Turma não encontrada"));

        Aluno aluno = alunoRepository.findById(idAluno)
                .orElseThrow(() -> new RuntimeException("Aluno não encontrado"));

        if (!turma.getAlunos().contains(aluno)) {
            turma.adicionarAluno(aluno);

            Turma turmaSalva = turmaRepository.save(turma);

            EnturmacaoCadastroDTO enturmacaoDTO = new EnturmacaoCadastroDTO();
            enturmacaoDTO.setIdAluno(aluno.getId());
            enturmacaoDTO.setIdTurma(turmaSalva.getIdTurma());

            enturmacaoService.criar(enturmacaoDTO);

            return turmaSalva;
        }

        return turma;
    }

    public Turma removerAluno(Long idTurma, Long idAluno) {
        Turma turma = turmaRepository.findById(idTurma)
                .orElseThrow(() -> new RuntimeException("Turma não encontrada"));

        Aluno aluno = alunoRepository.findById(idAluno)
                .orElseThrow(() -> new RuntimeException("Aluno não encontrado"));

        turma.removerAluno(aluno);

        return turmaRepository.save(turma);
    }

    // LISTAR TODOS ALUNOS DA TURMA
    public List<Aluno> listarAlunos(Long idTurma) {
        Turma turma = turmaRepository.findById(idTurma)
                .orElseThrow(() -> new RuntimeException("Turma não encontrada"));

        return turma.getAlunos();
    }

    public List<Turma> listarPorProfessor(Long idProfessor) {
        return turmaRepository.findByProfessorId(idProfessor);
    }
}