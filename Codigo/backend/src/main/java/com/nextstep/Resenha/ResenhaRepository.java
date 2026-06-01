package com.nextstep.Resenha;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ResenhaRepository extends JpaRepository<Resenha, Long> {

    List<Resenha> findByArtigoIdOrderByDataCriacaoDesc(Long artigoId);

    long countByArtigoId(Long artigoId);
}
