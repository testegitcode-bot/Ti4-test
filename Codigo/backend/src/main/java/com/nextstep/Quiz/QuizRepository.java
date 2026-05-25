package com.nextstep.Quiz;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

// Repository é a camada que fala diretamente com o banco de dados.
// Ao estender JpaRepository<Quiz, Long>, ganhamos GRATUITAMENTE os métodos:
//   save(quiz)         -> INSERT ou UPDATE no banco
//   findById(id)       -> SELECT WHERE id = ?
//   findAll()          -> SELECT * FROM quiz
//   deleteById(id)     -> DELETE WHERE id = ?
//   existsById(id)     -> verifica se existe
// O Spring Data JPA cria a implementação automaticamente em tempo de execução.
// O primeiro parâmetro genérico (Quiz) é a entidade.
// O segundo (Long) é o tipo da chave primária.
public interface QuizRepository extends JpaRepository<Quiz, Long> {

    // Método customizado: buscar todos os quizzes de um professor específico.
    // O Spring Data JPA interpreta o nome do método e gera automaticamente
    // o SQL: SELECT * FROM quiz WHERE professor_id = ?
    // Convenção: findBy + NomeDoCampo + NomeDoCampoAninhado
    // "Professor" -> campo professor em Quiz
    // "Id"        -> campo id dentro de Professor
    List<Quiz> findByProfessorId(Long professorId);


    @Query("""
    SELECT q
    FROM Quiz q
    JOIN q.turmas t
    WHERE t.idTurma = :idTurma
    """)
    List<Quiz> buscarPorTurma(@Param("idTurma") Long idTurma);
}
