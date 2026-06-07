package com.nextstep.RespostaArtigo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RespostaArtigoRepository extends JpaRepository<RespostaArtigo, Long> {

    List<RespostaArtigo> findByArtigoId(Long artigoId);

    List<RespostaArtigo> findByAlunoId(Long alunoId);

    List<RespostaArtigo> findByStatus(String status);

    List<RespostaArtigo> findByStatusOrderByDataRespostaDesc(String status);

    List<RespostaArtigo> findByArtigoIdAndStatus(Long artigoId, String status);

    void deleteByArtigoId(Long artigoId);
}