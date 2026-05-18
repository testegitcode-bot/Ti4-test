package com.nextstep.Aluno;

import jakarta.persistence.*;

@Entity
@Table(name = "aluno")
public class Aluno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nome;

    @Column(unique = true)
    private String matricula;

    @Column(unique = true)
    private String email; 

    private String senha;

    // construtor vazio
    public Aluno() {}

    // construtor completo
    public Aluno(String nome, String matricula, String email, String senha) {
        this.nome = nome;
        this.matricula = matricula;
        this.email = email;
        this.senha = senha;
    }

    // getters e setters
    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getMatricula() {
        return matricula;
    }

    public void setMatricula(String matricula) {
        this.matricula = matricula;
    }

    public String getEmail() {   
        return email;
    }

    public void setEmail(String email) {  
        this.email = email;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }
}