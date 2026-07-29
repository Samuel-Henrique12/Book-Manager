package com.bookmanager.estante;

import com.bookmanager.estante.dto.EstanteRequestDTO;
import com.bookmanager.estante.dto.EstanteRespostaDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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

// Endpoints da Estante a Partir de um Livro
@RestController
@RequestMapping("/books/{livroId}/shelf")
@RequiredArgsConstructor
public class EstanteLivroController {

    private final EstanteService estanteService;

    // Endpoint para Consultar a Própria Vaga Deste Livro
    @GetMapping
    public ResponseEntity<EstanteRespostaDTO> minha(@PathVariable Long livroId,
            @AuthenticationPrincipal UserDetails autenticado) {
        return estanteService.minhaVaga(livroId, autenticado.getUsername())
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    // Endpoint para Adicionar ou Atualizar o Livro na Estante
    @PutMapping
    public ResponseEntity<EstanteRespostaDTO> salvar(@PathVariable Long livroId,
            @AuthenticationPrincipal UserDetails autenticado,
            @Valid @RequestBody EstanteRequestDTO requisicao) {
        return ResponseEntity.ok(
                estanteService.salvar(livroId, autenticado.getUsername(), requisicao));
    }

    // Endpoint para Tirar o Livro da Estante
    @DeleteMapping
    public ResponseEntity<Void> remover(@PathVariable Long livroId,
            @AuthenticationPrincipal UserDetails autenticado) {
        estanteService.remover(livroId, autenticado.getUsername());
        return ResponseEntity.noContent().build();
    }
}
