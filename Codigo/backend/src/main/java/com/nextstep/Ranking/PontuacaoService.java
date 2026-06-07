package com.nextstep.Ranking;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.nextstep.Aluno.Aluno;
import com.nextstep.Aluno.AlunoRepository;

@Service
public class PontuacaoService {

    private final PontuacaoRepository pontuacaoRepository;
    private final AlunoRepository alunoRepository;

    public PontuacaoService(
            PontuacaoRepository pontuacaoRepository,
            AlunoRepository alunoRepository
    ) {
        this.pontuacaoRepository = pontuacaoRepository;
        this.alunoRepository = alunoRepository;
    }

    public Pontuacao salvar(PontuacaoDTO dto) {
        if (dto.getPontuacao() == null || dto.getPontuacao() < 0) {
            throw new RuntimeException("Pontuação inválida");
        }

        Aluno aluno = alunoRepository.findById(dto.getAlunoId())
                .orElseThrow(() -> new RuntimeException("Aluno não encontrado"));

        Optional<Pontuacao> pontuacaoExistente =
                pontuacaoRepository.findByAlunoIdAndNomeJogo(dto.getAlunoId(), dto.getNomeJogo());

        if (pontuacaoExistente.isPresent()) {
            Pontuacao pontuacao = pontuacaoExistente.get();

            if (dto.getPontuacao() > pontuacao.getPontuacao()) {
                pontuacao.setPontuacao(dto.getPontuacao());
                pontuacao.setDataRegistro(LocalDateTime.now());
                return pontuacaoRepository.save(pontuacao);
            }

            return pontuacao;
        }

        Pontuacao novaPontuacao = new Pontuacao(
                dto.getNomeJogo(),
                dto.getPontuacao(),
                aluno
        );

        return pontuacaoRepository.save(novaPontuacao);
    }

    public List<RankingDTO> buscarRankingPorJogo(String nomeJogo) {
        return pontuacaoRepository.buscarRankingPorJogo(nomeJogo);
    }

    public List<RankingGlobalDTO> buscarRankingGlobal() {
        return pontuacaoRepository.buscarRankingGlobal();
    }
}