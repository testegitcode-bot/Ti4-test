package com.nextstep.Alocacao;

import com.nextstep.Professor.Professor;
import com.nextstep.Professor.ProfessorRepository;
import com.nextstep.Turma.Turma;
import com.nextstep.Turma.TurmaRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class AlocacaoService {

    private final AlocacaoRepository alocacaoRepository;
    private final ProfessorRepository professorRepository;
    private final TurmaRepository turmaRepository;

    public AlocacaoService(
            AlocacaoRepository alocacaoRepository,
            ProfessorRepository professorRepository,
            TurmaRepository turmaRepository
    ) {
        this.alocacaoRepository = alocacaoRepository;
        this.professorRepository = professorRepository;
        this.turmaRepository = turmaRepository;
    }

    public Alocacao criar(AlocacaoCadastroDTO dto) {

        Professor professor = professorRepository.findById(dto.getIdProfessor())
                .orElseThrow(() -> new RuntimeException("Professor não encontrado"));

        Turma turma = turmaRepository.findById(dto.getIdTurma())
                .orElseThrow(() -> new RuntimeException("Turma não encontrada"));

        Alocacao alocacao = new Alocacao();

        alocacao.setProfessor(professor);
        alocacao.setTurma(turma);
        alocacao.setNomeTurma(turma.getNome());
        alocacao.setDataAlocacao(LocalDate.now());

        return alocacaoRepository.save(alocacao);
    }

    public Alocacao buscarPorId(Long id) {
        return alocacaoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alocação não encontrada"));
    }

    public void deletar(Long id) {
        alocacaoRepository.deleteById(id);
    }
}