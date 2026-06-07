package com.nextstep.Artigo;

import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nextstep.Professor.Professor;
import com.nextstep.Professor.ProfessorRepository;
import com.nextstep.RespostaArtigo.RespostaArtigoRepository;
import com.nextstep.Turma.Turma;
import com.nextstep.Turma.TurmaRepository;

@Service
public class ArtigoService {

    private final ArtigoRepository artigoRepository;
    private final ProfessorRepository professorRepository;
    private final TurmaRepository turmaRepository;
    private final RespostaArtigoRepository respostaArtigoRepository;
    private final JdbcTemplate jdbcTemplate;

    public ArtigoService(
            ArtigoRepository artigoRepository,
            ProfessorRepository professorRepository,
            TurmaRepository turmaRepository,
            RespostaArtigoRepository respostaArtigoRepository,
            JdbcTemplate jdbcTemplate
    ) {
        this.artigoRepository = artigoRepository;
        this.professorRepository = professorRepository;
        this.turmaRepository = turmaRepository;
        this.respostaArtigoRepository = respostaArtigoRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    public ArtigoResponseDTO criar(ArtigoRequestDTO dto) {
        if (dto.getTitulo() == null || dto.getTitulo().isBlank()) {
            throw new RuntimeException("Título é obrigatório");
        }

        if (dto.getConteudo() == null || dto.getConteudo().isBlank()) {
            throw new RuntimeException("Conteúdo é obrigatório");
        }

        if (dto.getProfessorId() == null) {
            throw new RuntimeException("Professor é obrigatório");
        }

        Professor professor = professorRepository.findById(dto.getProfessorId())
                .orElseThrow(() -> new RuntimeException("Professor não encontrado"));

        Artigo artigo = new Artigo();
        artigo.setTitulo(dto.getTitulo());
        artigo.setConteudo(dto.getConteudo());
        artigo.setProfessor(professor);

        if (dto.getTurmaId() != null) {
            Turma turma = turmaRepository.findById(dto.getTurmaId())
                    .orElseThrow(() -> new RuntimeException("Turma não encontrada"));

            artigo.setTurma(turma);
        }

        return new ArtigoResponseDTO(artigoRepository.save(artigo));
    }

    public List<ArtigoResponseDTO> listarTodos() {
        return artigoRepository.findAllByOrderByDataCriacaoDesc()
                .stream()
                .map(ArtigoResponseDTO::new)
                .toList();
    }

    public ArtigoResponseDTO buscarPorId(Long id) {
        Artigo artigo = artigoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Artigo não encontrado"));

        return new ArtigoResponseDTO(artigo);
    }

    public List<ArtigoResponseDTO> listarPorProfessor(Long professorId) {
        return artigoRepository.findByProfessorIdOrderByDataCriacaoDesc(professorId)
                .stream()
                .map(ArtigoResponseDTO::new)
                .toList();
    }

    public List<ArtigoResponseDTO> listarPorTurma(Long turmaId) {
        return artigoRepository.findByTurmaIdTurmaOrderByDataCriacaoDesc(turmaId)
                .stream()
                .map(ArtigoResponseDTO::new)
                .toList();
    }

    @Transactional
    public void deletar(Long id) {
        jdbcTemplate.update("DELETE FROM resenha WHERE id_artigo = ?", id);
        respostaArtigoRepository.deleteByArtigoId(id);
        artigoRepository.deleteById(id);
    }
}