package com.nextstep.Enturmacao;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EnturmacaoRepository extends JpaRepository<Enturmacao, Long> {

    List<Enturmacao> findByAlunoId(Long idAluno);

    List<Enturmacao> findByTurmaIdTurma(Long idTurma);
}