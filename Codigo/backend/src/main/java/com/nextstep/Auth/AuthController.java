package com.nextstep.Auth;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity; // Importante para o Logger
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nextstep.Aluno.Aluno;
import com.nextstep.Aluno.AlunoRepository;
import com.nextstep.Email.EmailService;
import com.nextstep.Professor.Professor;
import com.nextstep.Professor.ProfessorRepository;

@RestController
@RequestMapping("/auth")
@CrossOrigin("*")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class); // Criando o Logger
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

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        String email = request.email();
        String senha = request.senha();

        var aluno = alunoRepository.findByEmail(email);
        if (aluno.isPresent() && aluno.get().getSenha().equals(senha)) {
            return ResponseEntity.ok(new AuthResponse(aluno.get().getId(), aluno.get().getNome(), aluno.get().getEmail(), "student"));
        }

        var professor = professorRepository.findByEmail(email);
        if (professor.isPresent()) {
            Professor p = professor.get();

            // Usando o log.info em vez de System.out.println
            log.info("Tentativa de login de Professor: {}", email);

            if (!p.getSenha().equals(senha)) {
                log.warn("Falha no login: Senha incorreta para {}", email);
                return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password"));
            }

            if (p.isAtivo() == null || !p.isAtivo()) {
                log.warn("Falha no login: Professor {} está inativo", email);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Esta conta de professor ainda aguarda validação da diretoria."));
            }

            log.info("Login efetuado com sucesso para professor: {}", email);
            return ResponseEntity.ok(new AuthResponse(p.getId(), p.getNome(), p.getEmail(), "teacher"));
        }

        return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password"));
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
            professor.setAtivo(Boolean.FALSE);
            professor.setCodigoValidacao(codigo);
            professor.setDataExpiracaoCodigo(LocalDateTime.now().plusHours(24));

            Professor saved = professorRepository.save(professor);

            try {
                emailService.enviarCodigoValidacaoProfessor(saved.getNome(), saved.getEmail(), codigo);
            } catch (Exception e) {
                System.err.println("ERRO AO ENVIAR E-MAIL DE VALIDAÇÃO:");
                e.printStackTrace();
}

            return ResponseEntity.ok(Map.of(
                "message", "Cadastro realizado com sucesso! Um código de validação foi gerado.",
                "requiresVerification", true,
                "email", saved.getEmail()
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

        // 1. Verifica se o professor existe
        if (professor == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    Map.of("message", "Professor não encontrado.")
            );
        }

        // 2. Verifica se o código bate
        if (professor.getCodigoValidacao() == null || !professor.getCodigoValidacao().equals(request.codigo())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    Map.of("message", "Código inválido. Por favor, solicite um novo.")
            );
        }

        // 3. Verifica se o código expirou
        if (professor.getDataExpiracaoCodigo() == null || LocalDateTime.now().isAfter(professor.getDataExpiracaoCodigo())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    Map.of("message", "Código expirado. Por favor, solicite um novo.")
            );
        }

        // Se passou em tudo, ativa o professor
        professor.setAtivo(Boolean.TRUE);
        professor.setCodigoValidacao(null);
        professor.setDataExpiracaoCodigo(null);
        professorRepository.save(professor);

        return ResponseEntity.ok(new AuthResponse(
                professor.getId(),
                professor.getNome(),
                professor.getEmail(),
                "teacher" 
        ));
    }

    // REENVIAR CODIGO
    @PostMapping("/resend-code")
    public ResponseEntity<?> resendCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        var professorOpt = professorRepository.findByEmail(email);

        if (professorOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Professor não encontrado"));
        }

        Professor professor = professorOpt.get();
        // Gera um novo código
        String novoCodigo = String.format("%06d", RANDOM.nextInt(1_000_000));
        
        // Atualiza o banco
        professor.setCodigoValidacao(novoCodigo);
        professor.setDataExpiracaoCodigo(LocalDateTime.now().plusHours(24));
        professorRepository.save(professor);

        // Reenvia o e-mail
        try {
            emailService.enviarCodigoValidacaoProfessor(professor.getNome(), professor.getEmail(), novoCodigo);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    Map.of("message", "Falha ao reenviar e-mail: " + e.getMessage())
            );
        }

        return ResponseEntity.ok(Map.of("message", "Novo código enviado com sucesso!"));
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