package com.nextstep.Alocacao;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AlocacaoRepository extends JpaRepository<Alocacao, Long> {

    List<Alocacao> findByTurmaIdTurma(Long idTurma);

    List<Alocacao> findByProfessorId(Long idProfessor);
}