package com.nextstep.Professor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nextstep.Email.EmailService;
import com.nextstep.Turma.TurmaRepository;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ProfessorService {

    private final ProfessorRepository repository;
    private final TurmaRepository turmaRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    private static final SecureRandom RANDOM = new SecureRandom();

    public ProfessorService(ProfessorRepository repository, TurmaRepository turmaRepository,
                            PasswordEncoder passwordEncoder, EmailService emailService) {
        this.repository = repository;
        this.turmaRepository = turmaRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    // CADASTRO
    public Professor cadastrar(ProfessorCadastroDTO dto) {
        if (repository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("E-mail já cadastrado");
        }

        String codigo = String.format("%06d", RANDOM.nextInt(1_000_000));

        Professor professor = new Professor();
        professor.setNome(dto.getNome());
        professor.setEmail(dto.getEmail());
        professor.setSenha(passwordEncoder.encode(dto.getSenha()));
        professor.setAtivo(false);
        professor.setCodigoValidacao(codigo);
        professor.setDataExpiracaoCodigo(LocalDateTime.now().plusMinutes(15));

        Professor saved = repository.save(professor);

        try {
            emailService.enviarCodigoValidacaoProfessor(saved.getNome(), saved.getEmail(), codigo);
        } catch (Exception e) {
            throw new RuntimeException("Professor cadastrado, mas falha ao enviar e-mail de validação: " + e.getMessage());
        }

        return saved;
    }

    // LOGIN
    public Professor login(ProfessorLoginDTO dto) {
        Professor professor = repository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new RuntimeException("E-mail ou senha inválidos"));

        boolean senhaCorreta = passwordEncoder.matches(dto.getSenha(), professor.getSenha());

        if (!senhaCorreta) {
            throw new RuntimeException("E-mail ou senha inválidos");
        }

        if (!professor.isAtivo()) {
            throw new RuntimeException("Esta conta de professor ainda aguarda validação da diretoria.");
        }

        return professor;
    }

    // LISTAR
    public List<Professor> listarTodos() {
        return repository.findAll();
    }

    // BUSCAR POR ID
    public Optional<Professor> buscarPorId(Long id) {
        return repository.findById(id);
    }

    // ATUALIZAR
    public Professor atualizar(Long id, ProfessorCadastroDTO dto) {
    return repository.findById(id)
            .map(professor -> {

                professor.setNome(dto.getNome());
                professor.setEmail(dto.getEmail());
                professor.setBio(dto.getBio());
                professor.setTelefone(dto.getTelefone());
                professor.setSenha(dto.getSenha());

                return repository.save(professor);
            })
            .orElseThrow(() -> new RuntimeException("Professor não encontrado"));
    }

    // DELETAR
    @Transactional
    public void deletar(Long id) {

        Professor professor = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Professor não encontrado"));

        turmaRepository.desvincularProfessorDasTurmas(id);
        turmaRepository.removerAlocacoesDoProfessor(id);

        repository.delete(professor);
    }
}