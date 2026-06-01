package com.nextstep.Artigo;

import java.util.List;

import org.springframework.stereotype.Service;

import com.nextstep.Aluno.Aluno;
import com.nextstep.Aluno.AlunoRepository;
import com.nextstep.Professor.Professor;
import com.nextstep.Professor.ProfessorRepository;
import com.nextstep.Turma.Turma;
import com.nextstep.Turma.TurmaRepository;

@Service
public class ArtigoService {

    private final ArtigoRepository artigoRepository;
    private final AlunoRepository alunoRepository;
    private final ProfessorRepository professorRepository;
    private final TurmaRepository turmaRepository;

    public ArtigoService(
            ArtigoRepository artigoRepository,
            AlunoRepository alunoRepository,
            ProfessorRepository professorRepository,
            TurmaRepository turmaRepository
    ) {
        this.artigoRepository = artigoRepository;
        this.alunoRepository = alunoRepository;
        this.professorRepository = professorRepository;
        this.turmaRepository = turmaRepository;
    }

    public ArtigoResponseDTO criar(ArtigoRequestDTO dto) {
        if (dto.getTitulo() == null || dto.getTitulo().isBlank()) {
            throw new RuntimeException("Título é obrigatório");
        }

        if (dto.getConteudo() == null || dto.getConteudo().isBlank()) {
            throw new RuntimeException("Conteúdo é obrigatório");
        }

        if (dto.getAutorId() == null || dto.getTipoAutor() == null) {
            throw new RuntimeException("Autor é obrigatório");
        }

        Artigo artigo = new Artigo();

        artigo.setTitulo(dto.getTitulo());
        artigo.setConteudo(dto.getConteudo());

        String tipoAutor = dto.getTipoAutor().toUpperCase();

        if (dto.getTurmaId() != null) {
            Turma turma = turmaRepository.findById(dto.getTurmaId())
                    .orElseThrow(() -> new RuntimeException("Turma não encontrada"));

            artigo.setTurma(turma);
        }

        if (tipoAutor.equals("ALUNO") || tipoAutor.equals("STUDENT")) {
            Aluno aluno = alunoRepository.findById(dto.getAutorId())
                    .orElseThrow(() -> new RuntimeException("Aluno não encontrado"));

            artigo.setAluno(aluno);
            artigo.setTipoAutor("ALUNO");

        } else if (tipoAutor.equals("PROFESSOR") || tipoAutor.equals("TEACHER")) {
            Professor professor = professorRepository.findById(dto.getAutorId())
                    .orElseThrow(() -> new RuntimeException("Professor não encontrado"));

            artigo.setProfessor(professor);
            artigo.setTipoAutor("PROFESSOR");

        } else {
            throw new RuntimeException("Tipo de autor inválido");
        }

        Artigo salvo = artigoRepository.save(artigo);

        return new ArtigoResponseDTO(salvo);
    }

    public List<ArtigoResponseDTO> listarTodos() {
        return artigoRepository.findAllByOrderByDataCriacaoDesc()
                .stream()
                .map(ArtigoResponseDTO::new)
                .toList();
    }

    public List<ArtigoResponseDTO> listarParaAluno(Long idAluno) {
        return listarTodos();
    }

    public List<ArtigoResponseDTO> listarParaProfessor(Long idProfessor, Long idTurma, Long idAluno) {
        return artigoRepository.filtrarProfessor(idProfessor, idTurma, idAluno)
                .stream()
                .map(ArtigoResponseDTO::new)
                .toList();
    }

    public void deletar(Long id) {
        artigoRepository.deleteById(id);
    }
}