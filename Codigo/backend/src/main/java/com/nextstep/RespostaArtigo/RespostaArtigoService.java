package com.nextstep.RespostaArtigo;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nextstep.Aluno.Aluno;
import com.nextstep.Aluno.AlunoRepository;
import com.nextstep.Artigo.Artigo;
import com.nextstep.Artigo.ArtigoRepository;
import java.time.LocalDateTime;

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
        resposta.setStatus("PENDENTE");

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

    public List<RespostaArtigoResponseDTO> listarPendentes() {
        return repository.findByStatus("PENDENTE")
                .stream()
                .map(this::toDTO)
                .toList();
    }

    public List<RespostaArtigoResponseDTO> listarDestaques() {
        return repository.findByStatusOrderByDataRespostaDesc("APROVADA")
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional
public RespostaArtigoResponseDTO aprovar(Long id, Boolean destaque) {
    RespostaArtigo resposta = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Resposta não encontrada"));

    resposta.setStatus("APROVADA");
    resposta.setFeedbackProfessor(null);
    resposta.setDestaque(destaque != null && destaque);

    return toDTO(repository.save(resposta));
}

    @Transactional
public RespostaArtigoResponseDTO reprovar(Long id, String feedback) {
    RespostaArtigo resposta = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Resposta não encontrada"));

    resposta.setStatus("REPROVADA");
    resposta.setFeedbackProfessor(feedback);
    resposta.setDestaque(false);
    resposta.setPrazoReenvio(LocalDateTime.now().plusDays(3));

    return toDTO(repository.save(resposta));
}

@Transactional
public RespostaArtigoResponseDTO reenviar(Long id, String conteudo) {
    if (conteudo == null || conteudo.isBlank()) {
        throw new RuntimeException("A resposta não pode estar vazia");
    }

    RespostaArtigo resposta = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Resposta não encontrada"));

    if (!"REPROVADA".equals(resposta.getStatus())) {
        throw new RuntimeException("Apenas respostas reprovadas podem ser reenviadas");
    }

    if (resposta.getPrazoReenvio() == null ||
            LocalDateTime.now().isAfter(resposta.getPrazoReenvio())) {
        throw new RuntimeException("O prazo para reenvio desta resposta expirou");
    }

    resposta.setConteudo(conteudo);
    resposta.setStatus("PENDENTE");
    resposta.setFeedbackProfessor(null);
    resposta.setDestaque(false);
    resposta.setPrazoReenvio(null);
    resposta.setDataResposta(LocalDateTime.now());

    return toDTO(repository.save(resposta));
}

    private RespostaArtigoResponseDTO toDTO(RespostaArtigo resposta) {
        RespostaArtigoResponseDTO dto = new RespostaArtigoResponseDTO();

        dto.setId(resposta.getId());
        dto.setConteudo(resposta.getConteudo());
        dto.setStatus(resposta.getStatus());
        dto.setFeedbackProfessor(resposta.getFeedbackProfessor());
        dto.setDataResposta(resposta.getDataResposta());
        dto.setPrazoReenvio(resposta.getPrazoReenvio());
        dto.setDestaque(resposta.getDestaque());

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