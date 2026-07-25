package com.bookmanager.livro.dto;

import java.time.Instant;

// Detalhe de Livro
public record LivroRespostaDTO(
        Long id,
        String titulo,
        String autor,
        Integer ano,
        String descricao,
        String urlCapa,
        String isbn,
        Integer totalPaginas,
        Instant criadoEm,
        Instant atualizadoEm
) {
}
