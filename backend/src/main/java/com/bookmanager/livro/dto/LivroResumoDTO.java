package com.bookmanager.livro.dto;

import com.bookmanager.categoria.dto.CategoriaRespostaDTO;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.util.List;

// Resumo de Livro para Listagem
public record LivroResumoDTO(
        @JsonProperty("id") Long id,
        @JsonProperty("title") String titulo,
        @JsonProperty("author") String autor,
        @JsonProperty("year") Integer ano,
        @JsonProperty("description") String descricao,
        @JsonProperty("coverUrl") String urlCapa,
        @JsonProperty("averageRating") BigDecimal mediaAvaliacao,
        @JsonProperty("ratingsCount") Integer totalAvaliacoes,
        @JsonProperty("categories") List<CategoriaRespostaDTO> categorias
) {
}
