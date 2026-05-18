package com.nextstep.Auth;

import com.nextstep.Aluno.Aluno;
import com.nextstep.Aluno.AlunoRepository;
import com.nextstep.Professor.Professor;
import com.nextstep.Professor.ProfessorRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin("*")
public class AuthController {

    private final AlunoRepository alunoRepository;
    private final ProfessorRepository professorRepository;

    public AuthController(AlunoRepository alunoRepository, ProfessorRepository professorRepository) {
        this.alunoRepository = alunoRepository;
        this.professorRepository = professorRepository;
    }

    // LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        String email = request.email();
        String senha = request.senha();

        // tenta aluno
        var aluno = alunoRepository.findByEmail(email);

        if (aluno.isPresent() && aluno.get().getSenha().equals(senha)) {
            Aluno a = aluno.get();

            return ResponseEntity.ok(new AuthResponse(
                    a.getId(),
                    a.getNome(),
                    a.getEmail(),
                    "student"
            ));
        }

        // tenta professor
        var professor = professorRepository.findByEmail(email);

        if (professor.isPresent() && professor.get().getSenha().equals(senha)) {
            Professor p = professor.get();

            return ResponseEntity.ok(new AuthResponse(
                    p.getId(),
                    p.getNome(),
                    p.getEmail(),
                    "teacher"
            ));
        }

        return ResponseEntity.status(401).body(
                Map.of("message", "Invalid email or password")
        );
    }

    // REGISTER
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {

        if ("student".equals(request.role())) {

            Aluno aluno = new Aluno();
            aluno.setNome(request.nome());
            aluno.setEmail(request.email());
            aluno.setMatricula(request.email()); // temporário
            aluno.setSenha(request.senha());

            Aluno saved = alunoRepository.save(aluno);

            return ResponseEntity.ok(new AuthResponse(
                    saved.getId(),
                    saved.getNome(),
                    saved.getEmail(),
                    "student"
            ));
        }

        if ("teacher".equals(request.role())) {

            Professor professor = new Professor();
            professor.setNome(request.nome());
            professor.setEmail(request.email());
            professor.setSenha(request.senha());

            Professor saved = professorRepository.save(professor);

            return ResponseEntity.ok(new AuthResponse(
                    saved.getId(),
                    saved.getNome(),
                    saved.getEmail(),
                    "teacher"
            ));
        }

        return ResponseEntity.badRequest().body(
                Map.of("message", "Invalid role")
        );
    }

    // DTOs
    public record LoginRequest(
            String email,
            String senha
    ) {}

    public record RegisterRequest(
            String nome,
            String email,
            String senha,
            String role
    ) {}

    public record AuthResponse(
            Long id,
            String nome,
            String email,
            String role
    ) {}
}