package com.bookmanager.livro.dto;

import com.bookmanager.categoria.dto.CategoriaRespostaDTO;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

// Detalhe de Livro
public record LivroRespostaDTO(
        @JsonProperty("id") Long id,
        @JsonProperty("title") String titulo,
        @JsonProperty("subtitle") String subtitulo,
        @JsonProperty("author") String autor,
        @JsonProperty("year") Integer ano,
        @JsonProperty("description") String descricao,
        @JsonProperty("coverUrl") String urlCapa,
        @JsonProperty("isbn") String isbn,
        @JsonProperty("pageCount") Integer totalPaginas,
        @JsonProperty("publisher") String editora,
        @JsonProperty("publishedDate") String dataPublicacao,
        @JsonProperty("language") String idioma,
        @JsonProperty("averageRating") BigDecimal mediaAvaliacao,
        @JsonProperty("ratingsCount") Integer totalAvaliacoes,
        @JsonProperty("previewLink") String linkPrevia,
        @JsonProperty("categories") List<CategoriaRespostaDTO> categorias,
        @JsonProperty("createdAt") Instant criadoEm,
        @JsonProperty("updatedAt") Instant atualizadoEm
) {
}
