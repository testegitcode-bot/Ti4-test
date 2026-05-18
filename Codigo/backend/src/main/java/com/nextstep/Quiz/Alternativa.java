package com.nextstep.Quiz;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

// @Entity diz ao Spring/JPA que esta classe representa uma tabela no banco de dados.
// O Hibernate vai criar (ou atualizar) automaticamente a tabela "alternativa" no PostgreSQL
// porque usamos spring.jpa.hibernate.ddl-auto=update no application.properties.
@Entity
@Table(name = "alternativa")
public class Alternativa {

    // @Id marca este campo como a chave primária da tabela.
    // @GeneratedValue com IDENTITY delega ao banco a responsabilidade de gerar
    // o próximo número (autoincrement do PostgreSQL).
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // O texto da alternativa, ex: "She goes to school every day."
    private String texto;

    // Booleano que indica se esta alternativa é a resposta correta.
    // true = correta, false = incorreta.
    private Boolean correta;

    // @ManyToOne: muitas alternativas pertencem a uma questão.
    // @JoinColumn(name = "questao_id"): o banco vai criar uma coluna "questao_id"
    // nesta tabela para guardar o ID da questão a que essa alternativa pertence.
    // @JsonBackReference: ESSENCIAL para evitar loop infinito na serialização JSON.
    // Quando o Jackson tentar converter o objeto para JSON, ele vai IGNORAR este campo
    // (o campo "questao" dentro de Alternativa). Sem isso, teríamos:
    // Alternativa -> Questao -> Alternativa -> Questao -> ... (loop eterno).
    @ManyToOne
    @JoinColumn(name = "questao_id")
    @JsonIgnore
    private Questao questao;

    // Construtor vazio obrigatório: o JPA/Hibernate precisa instanciar
    // objetos sem argumentos ao carregar dados do banco.
    public Alternativa() {}

    public Alternativa(String texto, Boolean correta) {
        this.texto = texto;
        this.correta = correta;
    }

    // --- Getters e Setters ---
    // O Spring usa esses métodos para ler e gravar os valores dos campos.

    public Long getId() {
        return id;
    }

    public String getTexto() {
        return texto;
    }

    public void setTexto(String texto) {
        this.texto = texto;
    }

    public Boolean getCorreta() {
        return correta;
    }

    public void setCorreta(Boolean correta) {
        this.correta = correta;
    }

    public Questao getQuestao() {
        return questao;
    }

    public void setQuestao(Questao questao) {
        this.questao = questao;
    }
}
