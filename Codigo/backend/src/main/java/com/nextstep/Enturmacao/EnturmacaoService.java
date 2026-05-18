package com.nextstep.Enturmacao;

import com.nextstep.Aluno.Aluno;
import com.nextstep.Aluno.AlunoRepository;
import com.nextstep.Turma.Turma;
import com.nextstep.Turma.TurmaRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class EnturmacaoService {

    private final EnturmacaoRepository enturmacaoRepository;
    private final AlunoRepository alunoRepository;
    private final TurmaRepository turmaRepository;

    public EnturmacaoService(
            EnturmacaoRepository enturmacaoRepository,
            AlunoRepository alunoRepository,
            TurmaRepository turmaRepository
    ) {
        this.enturmacaoRepository = enturmacaoRepository;
        this.alunoRepository = alunoRepository;
        this.turmaRepository = turmaRepository;
    }

    public Enturmacao criar(EnturmacaoCadastroDTO dto) {

        Aluno aluno = alunoRepository.findById(dto.getIdAluno())
                .orElseThrow(() -> new RuntimeException("Aluno não encontrado"));

        Turma turma = turmaRepository.findById(dto.getIdTurma())
                .orElseThrow(() -> new RuntimeException("Turma não encontrada"));

        Enturmacao enturmacao = new Enturmacao();

        enturmacao.setAluno(aluno);
        enturmacao.setTurma(turma);

        enturmacao.setNomeAluno(aluno.getNome());
        enturmacao.setNomeTurma(turma.getNome());

        enturmacao.setDataEnturmacao(LocalDate.now());

        return enturmacaoRepository.save(enturmacao);
    }
}