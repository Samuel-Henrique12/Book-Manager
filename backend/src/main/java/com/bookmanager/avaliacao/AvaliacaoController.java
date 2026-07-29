package com.bookmanager.avaliacao;

import com.bookmanager.avaliacao.dto.AvaliacaoRequestDTO;
import com.bookmanager.avaliacao.dto.AvaliacaoRespostaDTO;
import com.bookmanager.avaliacao.dto.ResumoAvaliacoesDTO;
import com.bookmanager.comum.paginacao.RespostaPaginadaDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// Endpoints de Avaliacoes de um Livro
@RestController
@RequestMapping("/books/{livroId}")
@RequiredArgsConstructor
public class AvaliacaoController {

    private final AvaliacaoService avaliacaoService;

    // Endpoint para Listar as Resenhas do Livro
    @GetMapping("/reviews")
    public ResponseEntity<RespostaPaginadaDTO<AvaliacaoRespostaDTO>> listar(
            @PathVariable Long livroId,
            @AuthenticationPrincipal UserDetails autenticado,
            @PageableDefault(size = 10, sort = "criadoEm", direction = Sort.Direction.DESC)
            Pageable paginacao) {
        return ResponseEntity.ok(
                avaliacaoService.listarResenhas(livroId, autenticado.getUsername(), paginacao));
    }

    // Endpoint para o Resumo da Comunidade (Média e Distribuição)
    @GetMapping("/reviews/summary")
    public ResponseEntity<ResumoAvaliacoesDTO> resumo(@PathVariable Long livroId) {
        return ResponseEntity.ok(avaliacaoService.resumo(livroId));
    }

    // Endpoint para Obter a Própria Avaliação
    @GetMapping("/reviews/mine")
    public ResponseEntity<AvaliacaoRespostaDTO> minha(@PathVariable Long livroId,
            @AuthenticationPrincipal UserDetails autenticado) {
        return avaliacaoService.minhaAvaliacao(livroId, autenticado.getUsername())
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    // Endpoint para Criar ou Substituir a Própria Avaliação
    @PutMapping("/reviews/mine")
    public ResponseEntity<AvaliacaoRespostaDTO> salvar(@PathVariable Long livroId,
            @AuthenticationPrincipal UserDetails autenticado,
            @Valid @RequestBody AvaliacaoRequestDTO requisicao) {
        return ResponseEntity.ok(
                avaliacaoService.salvar(livroId, autenticado.getUsername(), requisicao));
    }

    // Endpoint para Remover a Própria Avaliação
    @DeleteMapping("/reviews/mine")
    public ResponseEntity<Void> remover(@PathVariable Long livroId,
            @AuthenticationPrincipal UserDetails autenticado) {
        avaliacaoService.remover(livroId, autenticado.getUsername());
        return ResponseEntity.noContent().build();
    }
}
