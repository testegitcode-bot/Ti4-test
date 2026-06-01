package com.nextstep.Resenha;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/artigos/{artigoId}/reviews")
@CrossOrigin("*")
public class ResenhaController {

    private final ResenhaService resenhaService;

    public ResenhaController(ResenhaService resenhaService) {
        this.resenhaService = resenhaService;
    }

    @PostMapping
    public ResponseEntity<ResenhaResponseDTO> criar(
            @PathVariable Long artigoId,
            @RequestBody ResenhaRequestDTO dto) {
        return ResponseEntity.ok(resenhaService.criar(artigoId, dto));
    }

    @GetMapping
    public ResponseEntity<List<ResenhaResponseDTO>> listar(@PathVariable Long artigoId) {
        return ResponseEntity.ok(resenhaService.listarPorArtigo(artigoId));
    }
}
