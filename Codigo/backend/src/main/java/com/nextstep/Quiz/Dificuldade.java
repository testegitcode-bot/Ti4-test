package com.nextstep.Quiz;

// Enum é um tipo especial em Java que representa um conjunto FIXO e conhecido de constantes.
// Em vez de usar Strings soltas como "facil", "media", "dificil" (sujeitas a erros de digitação),
// usamos um enum — o compilador garante que só esses 3 valores existem no sistema.
//
// Por que não usar Integer (1, 2, 3) direto?
// Porque um número puro não tem semântica: o que significa o "2"?
// Com o enum, o código é auto-explicativo: Dificuldade.MEDIA é claro para qualquer dev.
public enum Dificuldade {

    // Cada constante do enum recebe um valor de pontos no construtor.
    // FACIL  → 1 ponto
    // MEDIA  → 2 pontos
    // DIFICIL → 3 pontos
    FACIL(1),
    MEDIA(2),
    DIFICIL(3);

    // Campo privado que guarda o valor de pontos associado à dificuldade.
    // É "final" porque nunca muda depois de criado.
    private final int valorPontos;

    // Construtor do enum: chamado internamente pelo Java ao declarar cada constante acima.
    // Ex: FACIL(1) chama este construtor com valorPontos = 1.
    Dificuldade(int valorPontos) {
        this.valorPontos = valorPontos;
    }

    // Getter que expõe o valor de pontos.
    // Permite que o Service faça: questao.getDificuldade().getValorPontos()
    // e obtenha 1, 2 ou 3 dependendo da dificuldade da questão.
    public int getValorPontos() {
        return valorPontos;
    }
}
