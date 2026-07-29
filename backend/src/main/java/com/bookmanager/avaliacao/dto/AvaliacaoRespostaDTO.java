package com.bookmanager.avaliacao.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;

// Avaliacao Exibida na Pagina do Livro
public record AvaliacaoRespostaDTO(
        @JsonProperty("id") Long id,
        @JsonProperty("readerName") String nomeLeitor,
        @JsonProperty("rating") Short nota,
        @JsonProperty("review") String resenha,
        @JsonProperty("spoiler") boolean spoiler,
        @JsonProperty("mine") boolean minha,
        @JsonProperty("createdAt") Instant criadoEm,
        @JsonProperty("updatedAt") Instant atualizadoEm
) {
}
