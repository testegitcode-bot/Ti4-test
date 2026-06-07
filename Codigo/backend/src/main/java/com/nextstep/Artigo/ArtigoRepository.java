package com.nextstep.Artigo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ArtigoRepository extends JpaRepository<Artigo, Long> {

    List<Artigo> findAllByOrderByDataCriacaoDesc();

    List<Artigo> findByProfessorIdOrderByDataCriacaoDesc(Long professorId);

    List<Artigo> findByTurmaIdTurmaOrderByDataCriacaoDesc(Long turmaId);
}