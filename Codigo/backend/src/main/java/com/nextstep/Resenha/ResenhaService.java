package com.nextstep.Resenha;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.nextstep.Artigo.Artigo;
import com.nextstep.Artigo.ArtigoRepository;

@Service
public class ResenhaService {

    private final ResenhaRepository resenhaRepository;
    private final ArtigoRepository artigoRepository;

    public ResenhaService(ResenhaRepository resenhaRepository, ArtigoRepository artigoRepository) {
        this.resenhaRepository = resenhaRepository;
        this.artigoRepository = artigoRepository;
    }

    public ResenhaResponseDTO criar(Long artigoId, ResenhaRequestDTO dto) {
        Artigo artigo = artigoRepository.findById(artigoId)
                .orElseThrow(() -> new RuntimeException("Article not found with id: " + artigoId));

        if (dto.getConteudo() == null || dto.getConteudo().isBlank()) {
            throw new RuntimeException("Review content cannot be empty.");
        }

        Resenha resenha = new Resenha();
        resenha.setConteudo(dto.getConteudo().trim());
        resenha.setAutorId(dto.getAutorId());
        resenha.setAutorNome(dto.getAutorNome());
        resenha.setArtigo(artigo);

        return new ResenhaResponseDTO(resenhaRepository.save(resenha));
    }

    public List<ResenhaResponseDTO> listarPorArtigo(Long artigoId) {
        return resenhaRepository.findByArtigoIdOrderByDataCriacaoDesc(artigoId)
                .stream()
                .map(ResenhaResponseDTO::new)
                .collect(Collectors.toList());
    }

    public long contarPorArtigo(Long artigoId) {
        return resenhaRepository.countByArtigoId(artigoId);
    }
}
