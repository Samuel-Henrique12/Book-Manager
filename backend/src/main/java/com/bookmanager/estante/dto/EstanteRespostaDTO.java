package com.bookmanager.estante.dto;

import com.bookmanager.estante.StatusLeitura;
import com.bookmanager.livro.dto.LivroResumoDTO;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;

// Item da Estante do Leitor
public record EstanteRespostaDTO(
        @JsonProperty("id") Long id,
        @JsonProperty("book") LivroResumoDTO livro,
        @JsonProperty("status") StatusLeitura status,
        @JsonProperty("favorite") boolean favorito,
        @JsonProperty("currentPage") Integer paginaAtual,
        @JsonProperty("totalPages") Integer totalPaginas,
        @JsonProperty("progress") Integer progresso,
        @JsonProperty("updatedAt") Instant atualizadoEm
) {
}
