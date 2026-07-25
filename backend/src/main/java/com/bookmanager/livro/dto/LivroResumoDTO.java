package com.bookmanager.livro.dto;

// Resumo de Livro para Listagem
public record LivroResumoDTO(
        Long id,
        String titulo,
        String autor,
        Integer ano,
        String descricao,
        String urlCapa
) {
}
