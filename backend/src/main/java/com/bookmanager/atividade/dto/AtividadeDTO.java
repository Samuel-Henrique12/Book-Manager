package com.bookmanager.atividade.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;

// Evento do Feed: uma Resenha ou um Comentario Recente
public record AtividadeDTO(
        @JsonProperty("type") TipoAtividade tipo,
        @JsonProperty("readerName") String nomeLeitor,
        @JsonProperty("bookId") Long livroId,
        @JsonProperty("bookTitle") String tituloLivro,
        @JsonProperty("bookCoverUrl") String urlCapa,
        @JsonProperty("rating") Short nota,
        @JsonProperty("text") String texto,
        @JsonProperty("spoiler") boolean spoiler,
        @JsonProperty("createdAt") Instant criadoEm
) {

    public enum TipoAtividade {
        REVIEW,
        COMMENT
    }
}
