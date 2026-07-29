package com.bookmanager.livro;

import com.bookmanager.comum.paginacao.RespostaPaginadaDTO;
import com.bookmanager.livro.dto.LivroRequestDTO;
import com.bookmanager.livro.dto.LivroRespostaDTO;
import com.bookmanager.livro.dto.LivroResumoDTO;
import jakarta.validation.Valid;
import java.net.URI;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

// Endpoints de Livros
@RestController
@RequestMapping("/books")
@RequiredArgsConstructor
public class LivroController {

    private final LivroService livroService;

    // Endpoint para Listar Livros com Filtro por Título e Paginação
    @GetMapping
    public ResponseEntity<RespostaPaginadaDTO<LivroResumoDTO>> listar(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String category,
            @AuthenticationPrincipal UserDetails autenticado,
            @PageableDefault(size = 10, sort = "title") Pageable paginacao) {
        return ResponseEntity.ok(livroService.listar(title, category,
                autenticado.getUsername(), OrdenacaoLivro.traduzir(paginacao)));
    }

    // Endpoint para Criar Novo Livro
    @PostMapping("/create")
    public ResponseEntity<LivroRespostaDTO> criar(@Valid @RequestBody LivroRequestDTO requisicao) {
        LivroRespostaDTO criado = livroService.criar(requisicao);
        return ResponseEntity.created(URI.create("/books/" + criado.id())).body(criado);
    }

    // Endpoint para Buscar Livro por ID
    @GetMapping("/{id}")
    public ResponseEntity<LivroRespostaDTO> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(livroService.buscarPorId(id));
    }

    // Endpoint para Atualizar Livro por ID (Só Admin)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LivroRespostaDTO> atualizar(@PathVariable Long id,
            @Valid @RequestBody LivroRequestDTO requisicao) {
        return ResponseEntity.ok(livroService.atualizar(id, requisicao));
    }

    // Endpoint para Remover Livro por ID (Só Admin)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> remover(@PathVariable Long id) {
        livroService.remover(id);
        return ResponseEntity.noContent().build();
    }
}
