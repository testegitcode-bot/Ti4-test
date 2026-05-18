package com.nextstep.Quiz;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

// Esta classe representa uma pergunta dentro de um Quiz.
// Ex: "What is the past tense of 'go'?" com 4 alternativas.
@Entity
@Table(name = "questao")
public class Questao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // O enunciado da pergunta: "What is the past tense of 'go'?"
    private String enunciado;

    // @Enumerated(EnumType.STRING): instrui o Hibernate a salvar o enum no banco
    // como texto (ex: "FACIL", "MEDIA", "DIFICIL") em vez de número inteiro (0, 1, 2).
    // Usar STRING é mais seguro: se a ordem das constantes do enum mudar no futuro,
    // os dados no banco continuam corretos. Com ORDINAL (inteiro), uma reordenação
    // corromperia todos os registros existentes.
    @Enumerated(EnumType.STRING)
    private Dificuldade dificuldade;

    // Pontos atribuídos automaticamente pelo QuizService com base na dificuldade.
    // O professor NÃO precisa informar este campo — o sistema calcula sozinho:
    // FACIL → 1 ponto | MEDIA → 2 pontos | DIFICIL → 3 pontos
    private Integer pontos;

    // @ManyToOne: muitas questões pertencem a um quiz.
    // @JsonBackReference: impede o loop infinito no JSON.
    // Quando o JSON do Quiz for gerado, este campo "quiz" dentro de Questao
    // não vai aparecer, pois o pai (Quiz) já está sendo serializado.
    @ManyToOne
    @JoinColumn(name = "quiz_id")
    @JsonIgnore
    private Quiz quiz;

    // @OneToMany: uma questão tem muitas alternativas.
    // mappedBy = "questao": diz ao Hibernate que quem controla o relacionamento
    // é o campo "questao" dentro da classe Alternativa (evita criar tabela extra).
    // cascade = CascadeType.ALL: ao salvar/deletar uma Questao,
    // o Hibernate automaticamente salva/deleta suas Alternativas também.
    // orphanRemoval = true: se uma Alternativa for removida da lista, ela é
    // deletada do banco de dados (órfã = sem dono = deletada).
    // @JsonManagedReference: esta é a "frente" do relacionamento — vai ser serializada no JSON.
    @OneToMany(mappedBy = "questao", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Alternativa> alternativas = new ArrayList<>();

    // Construtor vazio exigido pelo JPA.
    public Questao() {}

    // --- Getters e Setters ---

    public Long getId() {
        return id;
    }

    public String getEnunciado() {
        return enunciado;
    }

    public void setEnunciado(String enunciado) {
        this.enunciado = enunciado;
    }

    public Integer getPontos() {
        return pontos;
    }

    public void setPontos(Integer pontos) {
        this.pontos = pontos;
    }

    public Dificuldade getDificuldade() {
        return dificuldade;
    }

    public void setDificuldade(Dificuldade dificuldade) {
        this.dificuldade = dificuldade;
    }

    public Quiz getQuiz() {
        return quiz;
    }

    public void setQuiz(Quiz quiz) {
        this.quiz = quiz;
    }

    public List<Alternativa> getAlternativas() {
        return alternativas;
    }

    public void setAlternativas(List<Alternativa> alternativas) {
        this.alternativas = alternativas;
    }
}
