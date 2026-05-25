package com.nextstep.Professor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProfessorService {

    private final ProfessorRepository repository;
    private final PasswordEncoder passwordEncoder;

    public ProfessorService(ProfessorRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    // CADASTRO
    public Professor cadastrar(ProfessorCadastroDTO dto) {
        if (repository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("E-mail já cadastrado");
        }

        Professor professor = new Professor();
        professor.setNome(dto.getNome());
        professor.setEmail(dto.getEmail());
        professor.setSenha(passwordEncoder.encode(dto.getSenha()));

        return repository.save(professor);
    }

    // LOGIN
    public Professor login(ProfessorLoginDTO dto) {
        Professor professor = repository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new RuntimeException("E-mail ou senha inválidos"));

        boolean senhaCorreta = passwordEncoder.matches(dto.getSenha(), professor.getSenha());

        if (!senhaCorreta) {
            throw new RuntimeException("E-mail ou senha inválidos");
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

                // Atualiza senha apenas se vier preenchida
                if (dto.getSenha() != null && !dto.getSenha().isBlank()) {
                    professor.setSenha(passwordEncoder.encode(dto.getSenha()));
                }

                return repository.save(professor);
            })
            .orElseThrow(() -> new RuntimeException("Professor não encontrado"));
    }

    // DELETAR
    public void deletar(Long id) {
        repository.deleteById(id);
    }
}