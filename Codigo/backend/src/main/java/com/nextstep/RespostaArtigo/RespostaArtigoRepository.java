package com.nextstep.RespostaArtigo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RespostaArtigoRepository extends JpaRepository<RespostaArtigo, Long> {

    List<RespostaArtigo> findByArtigoId(Long artigoId);

    List<RespostaArtigo> findByAlunoId(Long alunoId);

    void deleteByArtigoId(Long artigoId);
}