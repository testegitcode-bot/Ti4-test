package com.nextstep.Aluno;

import java.util.List;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nextstep.Turma.TurmaRepository;
import com.nextstep.Turma.TurmaResumoDTO;

@Service
public class AlunoService {
    
    private final AlunoRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final TurmaRepository turmaRepository;
    

    public AlunoService(AlunoRepository repository, PasswordEncoder passwordEncoder, TurmaRepository turmaRepository) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.turmaRepository = turmaRepository;
    }

    public Aluno cadastrar(AlunoCadastroDTO dto) {
        if (repository.existsByMatricula(dto.getMatricula())) {
            throw new RuntimeException("Matrícula já cadastrada");
        }

        Aluno aluno = new Aluno();
        aluno.setNome(dto.getNome());
        aluno.setMatricula(dto.getMatricula());
        aluno.setSenha(passwordEncoder.encode(dto.getSenha()));

        return repository.save(aluno);
    }

    public Aluno login(AlunoLoginDTO dto) {
        Aluno aluno = repository.findByMatricula(dto.getMatricula())
                .orElseThrow(() -> new RuntimeException("Matrícula ou senha inválidos"));

        boolean senhaCorreta = passwordEncoder.matches(dto.getSenha(), aluno.getSenha());

        if (!senhaCorreta) {
            throw new RuntimeException("Matrícula ou senha inválidos");
        }

        return aluno;
    }

    public List<Aluno> listarTodos() {
        return repository.findAll();
    }

    public Optional<Aluno> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public Aluno atualizar(Long id, AlunoCadastroDTO dto) {
        return repository.findById(id)
                .map(aluno -> {
                    aluno.setNome(dto.getNome());
                    aluno.setEmail(dto.getEmail());
                    aluno.setSenha(dto.getSenha());

                    return repository.save(aluno);
                })
                .orElseThrow(() -> new RuntimeException("Aluno não encontrado"));
    }

    public List<TurmaResumoDTO> listarTurmasDoAluno(Long idAluno) {
        return turmaRepository.buscarTurmasDoAluno(idAluno);
    }
    
    @Transactional
    public void deletar(Long id) {
        Aluno aluno = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Aluno não encontrado"));

        turmaRepository.removerAlunoDasTurmas(id);
        turmaRepository.removerAlunoDasEnturmacoes(id);

        repository.delete(aluno);
    }
}