package com.bookmanager.comentario;

import com.bookmanager.comentario.dto.ComentarioRequestDTO;
import com.bookmanager.comentario.dto.ComentarioRespostaDTO;
import com.bookmanager.comum.paginacao.RespostaPaginadaDTO;
import jakarta.validation.Valid;
import java.net.URI;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

// Endpoints da Conversa de um Livro
@RestController
@RequestMapping("/books/{livroId}/comments")
@RequiredArgsConstructor
public class ComentarioController {

    private final ComentarioService comentarioService;

    // Endpoint para Listar a Conversa do Livro
    @GetMapping
    public ResponseEntity<RespostaPaginadaDTO<ComentarioRespostaDTO>> listar(
            @PathVariable Long livroId,
            @AuthenticationPrincipal UserDetails autenticado,
            @PageableDefault(size = 20, sort = "criadoEm", direction = Sort.Direction.DESC)
            Pageable paginacao) {
        return ResponseEntity.ok(
                comentarioService.listar(livroId, autenticado.getUsername(), paginacao));
    }

    // Endpoint para Publicar um Comentário
    @PostMapping
    public ResponseEntity<ComentarioRespostaDTO> publicar(@PathVariable Long livroId,
            @AuthenticationPrincipal UserDetails autenticado,
            @Valid @RequestBody ComentarioRequestDTO requisicao) {
        ComentarioRespostaDTO criado =
                comentarioService.publicar(livroId, autenticado.getUsername(), requisicao);
        return ResponseEntity
                .created(URI.create("/books/" + livroId + "/comments/" + criado.id()))
                .body(criado);
    }

    // Endpoint para Remover um Comentário (Autor ou Administrador)
    @DeleteMapping("/{comentarioId}")
    public ResponseEntity<Void> remover(@PathVariable Long comentarioId,
            @AuthenticationPrincipal UserDetails autenticado) {
        comentarioService.remover(comentarioId, autenticado.getUsername());
        return ResponseEntity.noContent().build();
    }

    // Endpoint para Marcar ou Desmarcar Spoiler (Somente Administrador)
    @PatchMapping("/{comentarioId}/spoiler")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ComentarioRespostaDTO> marcarSpoiler(@PathVariable Long comentarioId,
            @RequestParam boolean spoiler,
            @AuthenticationPrincipal UserDetails autenticado) {
        return ResponseEntity.ok(
                comentarioService.marcarSpoiler(comentarioId, spoiler, autenticado.getUsername()));
    }
}
