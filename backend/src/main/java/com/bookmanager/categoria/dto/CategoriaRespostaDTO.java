package com.bookmanager.categoria.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

// Categoria Exibida nos Filtros
public record CategoriaRespostaDTO(
        @JsonProperty("id") Long id,
        @JsonProperty("name") String nome,
        @JsonProperty("slug") String slug
) {
}
