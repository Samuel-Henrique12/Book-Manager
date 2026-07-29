package com.bookmanager.livro.dto;

import com.bookmanager.categoria.dto.CategoriaRespostaDTO;
import com.bookmanager.estante.StatusLeitura;
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
        // Nota Importada do Google Books
        @JsonProperty("averageRating") BigDecimal mediaAvaliacao,
        @JsonProperty("ratingsCount") Integer totalAvaliacoes,
        @JsonProperty("categories") List<CategoriaRespostaDTO> categorias,
        // Situacao do Livro na Estante de Quem Esta Consultando
        @JsonProperty("shelfStatus") StatusLeitura statusEstante,
        @JsonProperty("favorite") Boolean favorito,
        // Nota Dada pelos Leitores Daqui
        @JsonProperty("communityRating") BigDecimal mediaComunidade,
        @JsonProperty("communityRatingsCount") Long totalComunidade
) {

    // Copia o Resumo Acrescentando a Marcacao Pessoal
    public LivroResumoDTO comEstante(StatusLeitura status, Boolean marcadoFavorito) {
        return new LivroResumoDTO(id, titulo, autor, ano, descricao, urlCapa, mediaAvaliacao,
                totalAvaliacoes, categorias, status, marcadoFavorito, mediaComunidade,
                totalComunidade);
    }

    // Copia o Resumo Acrescentando a Nota da Comunidade
    public LivroResumoDTO comComunidade(BigDecimal media, Long total) {
        return new LivroResumoDTO(id, titulo, autor, ano, descricao, urlCapa, mediaAvaliacao,
                totalAvaliacoes, categorias, statusEstante, favorito, media, total);
    }
}
