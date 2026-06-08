package com.nextstep.Auth;

import com.nextstep.Aluno.Aluno;
import com.nextstep.Aluno.AlunoRepository;
import com.nextstep.Email.EmailService;
import com.nextstep.Professor.Professor;
import com.nextstep.Professor.ProfessorRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin("*")
public class AuthController {

    private final AlunoRepository alunoRepository;
    private final ProfessorRepository professorRepository;
    private final EmailService emailService;

    private static final SecureRandom RANDOM = new SecureRandom();

    public AuthController(AlunoRepository alunoRepository, ProfessorRepository professorRepository,
                          EmailService emailService) {
        this.alunoRepository = alunoRepository;
        this.professorRepository = professorRepository;
        this.emailService = emailService;
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

            if (!p.isAtivo()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                        Map.of("message", "Esta conta de professor ainda aguarda validação da diretoria.")
                );
            }

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

            if (professorRepository.existsByEmail(request.email())) {
                return ResponseEntity.badRequest().body(Map.of("message", "E-mail já cadastrado"));
            }

            String codigo = String.format("%06d", RANDOM.nextInt(1_000_000));

            Professor professor = new Professor();
            professor.setNome(request.nome());
            professor.setEmail(request.email());
            professor.setSenha(request.senha());
            professor.setAtivo(false);
            professor.setCodigoValidacao(codigo);
            professor.setDataExpiracaoCodigo(LocalDateTime.now().plusMinutes(15));

            Professor saved = professorRepository.save(professor);

            try {
                emailService.enviarCodigoValidacaoProfessor(saved.getNome(), saved.getEmail(), codigo);
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                        Map.of("message", "Professor cadastrado, mas falha ao enviar e-mail de validação: " + e.getMessage())
                );
            }

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

    // VERIFY PROFESSOR
    @PostMapping("/verify-professor")
    public ResponseEntity<?> verifyProfessor(@RequestBody VerifyRequest request) {

        Professor professor = professorRepository.findByEmail(request.email())
                .orElse(null);

        if (professor == null
                || professor.getCodigoValidacao() == null
                || !professor.getCodigoValidacao().equals(request.codigo())
                || professor.getDataExpiracaoCodigo() == null
                || LocalDateTime.now().isAfter(professor.getDataExpiracaoCodigo())) {

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    Map.of("message", "Código inválido ou expirado.")
            );
        }

        professor.setAtivo(true);
        professor.setCodigoValidacao(null);
        professor.setDataExpiracaoCodigo(null);
        professorRepository.save(professor);

        return ResponseEntity.ok(Map.of("message", "Conta validada com sucesso. O professor já pode fazer login."));
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

    public record VerifyRequest(
            String email,
            String codigo
    ) {}
}