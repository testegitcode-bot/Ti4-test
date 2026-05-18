package com.nextstep.Quiz;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

// @RestController: combina @Controller + @ResponseBody.
// Significa que esta classe recebe requisições HTTP e retorna JSON automaticamente.
// O Jackson (já incluso no Spring Boot) converte os objetos Java para JSON e vice-versa.
//
// @RequestMapping("/quizzes"): todas as rotas desta classe começam com /quizzes.
//
// @CrossOrigin("*"): permite que o frontend (rodando em outra porta, ex: localhost:3000)
// consiga chamar esta API. Sem isso, o navegador bloquearia as requisições por CORS
// (Cross-Origin Resource Sharing — política de segurança dos navegadores).
@RestController
@RequestMapping("/quizzes")
@CrossOrigin("*")
public class QuizController {

    // O Spring injeta automaticamente o QuizService aqui via construtor.
    // Este é o padrão de "Injeção de Dependência por Construtor" — recomendado
    // pelo próprio Spring por ser mais testável e deixar dependências explícitas.
    private final QuizService service;

    public QuizController(QuizService service) {
        this.service = service;
    }

    // =====================================================================
    // POST /quizzes
    // Cria um novo quiz completo com suas questões e alternativas.
    // O frontend envia um JSON no corpo da requisição (body).
    // @RequestBody: o Spring pega o JSON do body e converte para objeto Quiz.
    // Retorna 400 Bad Request se o professor informado não existir no banco.
    // =====================================================================
    @PostMapping
    public ResponseEntity<?> criar(@RequestBody QuizRequestDTO dto) {
        try {
            return ResponseEntity.ok(service.salvar(dto));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // =====================================================================
    // GET /quizzes
    // Retorna todos os quizzes cadastrados no banco.
    // Usado para exibir a lista de quizzes disponíveis.
    // =====================================================================
    @GetMapping
    public List<Quiz> listar() {
        return service.listarTodos();
    }

    // =====================================================================
    // GET /quizzes/{id}
    // Retorna um quiz específico pelo seu ID.
    // Ex: GET /quizzes/3 retorna o quiz de id=3 com todas as questões/alternativas.
    // @PathVariable: captura o {id} da URL e transforma em Long.
    // =====================================================================
    @GetMapping("/{id}")
    public Quiz buscar(@PathVariable Long id) {
        return service.buscarPorId(id)
                .orElseThrow(() -> new RuntimeException("Quiz não encontrado com id: " + id));
    }

    // =====================================================================
    // GET /quizzes/professor/{professorId}
    // Retorna todos os quizzes criados por um professor específico.
    // Permite que o professor veja apenas seus próprios quizzes.
    // Ex: GET /quizzes/professor/2 retorna os quizzes do professor de id=2.
    // =====================================================================
    @GetMapping("/professor/{professorId}")
    public List<Quiz> listarPorProfessor(@PathVariable Long professorId) {
        return service.listarPorProfessor(professorId);
    }

    // =====================================================================
    // PUT /quizzes/{id}
    // Atualiza completamente um quiz existente (substitui título, descrição,
    // questões e alternativas pelo novo conteúdo enviado no body).
    // Ex: PUT /quizzes/3 com o novo JSON no body.
    // =====================================================================
    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody QuizRequestDTO dto) {
        try {
            return ResponseEntity.ok(service.atualizar(id, dto));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // =====================================================================
    // DELETE /quizzes/{id}
    // Remove um quiz e TODOS os seus dados (questões e alternativas)
    // do banco de dados automaticamente (via cascade).
    // Ex: DELETE /quizzes/3 apaga o quiz 3 e tudo relacionado a ele.
    // =====================================================================
    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        service.deletar(id);
    }
}
