package com.bookmanager.categoria.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

// Categoria Exibida nos Filtros
public record CategoriaRespostaDTO(
        @JsonProperty("id") Long id,
        @JsonProperty("name") String nome,
        @JsonProperty("slug") String slug,
        @JsonProperty("bookCount") Long totalLivros
) {

    // Categoria Dentro do Livro Nao Precisa Carregar Contagem
    public CategoriaRespostaDTO(Long id, String nome, String slug) {
        this(id, nome, slug, null);
    }
}
