package com.nextstep.Ranking;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PontuacaoRepository extends JpaRepository<Pontuacao, Long> {

    Optional<Pontuacao> findByAlunoIdAndNomeJogo(Long alunoId, String nomeJogo);

    @Query("""
        SELECT new com.nextstep.Ranking.RankingDTO(
            p.aluno.nome,
            p.nomeJogo,
            p.pontuacao
        )
        FROM Pontuacao p
        WHERE p.nomeJogo = :nomeJogo
        ORDER BY p.pontuacao DESC
    """)
    List<RankingDTO> buscarRankingPorJogo(@Param("nomeJogo") String nomeJogo);

    List<Pontuacao> findByNomeJogo(String nomeJogo);

    @Query("""
        SELECT new com.nextstep.Ranking.RankingGlobalDTO(
            p.aluno.nome,
            SUM(p.pontuacao),
            COUNT(p.id)
        )
        FROM Pontuacao p
        GROUP BY p.aluno.id, p.aluno.nome
        ORDER BY SUM(p.pontuacao) DESC
    """)
    List<RankingGlobalDTO> buscarRankingGlobal();
}