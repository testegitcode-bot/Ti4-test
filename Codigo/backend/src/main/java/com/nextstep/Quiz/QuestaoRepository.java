package com.nextstep.Quiz;

import org.springframework.data.jpa.repository.JpaRepository;

public interface QuestaoRepository
        extends JpaRepository<Questao, Long> {
}