package com.nextstep.Quiz;

// DTO (Data Transfer Object) que representa os dados de uma alternativa
// enviados pelo frontend. Simples: só texto e se é a correta.
public record AlternativaDTO(
        String texto,
        Boolean correta
) {}
