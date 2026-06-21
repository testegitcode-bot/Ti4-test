package com.nextstep.RespostaArtigo;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nextstep.Aluno.Aluno;
import com.nextstep.Aluno.AlunoRepository;
import com.nextstep.Artigo.Artigo;
import com.nextstep.Artigo.ArtigoRepository;

@Service
public class RespostaArtigoService {

    private final RespostaArtigoRepository repository;
    private final ArtigoRepository artigoRepository;
    private final AlunoRepository alunoRepository;

    public RespostaArtigoService(
            RespostaArtigoRepository repository,
            ArtigoRepository artigoRepository,
            AlunoRepository alunoRepository
    ) {
        this.repository = repository;
        this.artigoRepository = artigoRepository;
        this.alunoRepository = alunoRepository;
    }

    public RespostaArtigoResponseDTO responder(RespostaArtigoRequestDTO dto) {
        if (dto.getConteudo() == null || dto.getConteudo().isBlank()) {
            throw new RuntimeException("A resposta não pode estar vazia");
        }

        Artigo artigo = artigoRepository.findById(dto.getArtigoId())
                .orElseThrow(() -> new RuntimeException("Artigo não encontrado"));

        Aluno aluno = alunoRepository.findById(dto.getAlunoId())
                .orElseThrow(() -> new RuntimeException("Aluno não encontrado"));

        RespostaArtigo resposta = new RespostaArtigo();
        resposta.setConteudo(dto.getConteudo());
        resposta.setArtigo(artigo);
        resposta.setAluno(aluno);

        return toDTO(repository.save(resposta));
    }

    public List<RespostaArtigoResponseDTO> listarPorArtigo(Long artigoId) {
        return repository.findByArtigoId(artigoId)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    public List<RespostaArtigoResponseDTO> listarPorAluno(Long alunoId) {
        return repository.findByAlunoId(alunoId)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional
    public RespostaArtigoResponseDTO avaliarComNota(Long id, Integer nota) {
        if (nota == null || nota < 0 || nota > 100) {
            throw new RuntimeException("A nota deve estar entre 0 e 100");
        }

        RespostaArtigo resposta = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resposta não encontrada"));

        resposta.setNota(nota);
        resposta.setDataAvaliacao(LocalDateTime.now());

        return toDTO(repository.save(resposta));
    }

    private RespostaArtigoResponseDTO toDTO(RespostaArtigo resposta) {
        RespostaArtigoResponseDTO dto = new RespostaArtigoResponseDTO();

        dto.setId(resposta.getId());
        dto.setConteudo(resposta.getConteudo());
        dto.setNota(resposta.getNota());
        dto.setDataResposta(resposta.getDataResposta());
        dto.setDataAvaliacao(resposta.getDataAvaliacao());

        if (resposta.getArtigo() != null) {
            dto.setArtigoId(resposta.getArtigo().getId());
            dto.setTituloArtigo(resposta.getArtigo().getTitulo());
        }

        if (resposta.getAluno() != null) {
            dto.setAlunoId(resposta.getAluno().getId());
            dto.setNomeAluno(resposta.getAluno().getNome());
        }

        return dto;
    }
}