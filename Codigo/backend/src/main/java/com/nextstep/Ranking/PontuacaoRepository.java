package com.nextstep.Ranking;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;
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
}