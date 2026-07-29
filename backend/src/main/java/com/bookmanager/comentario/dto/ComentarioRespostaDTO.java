package com.bookmanager.comentario.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;

// Comentario Exibido na Conversa do Livro
public record ComentarioRespostaDTO(
        @JsonProperty("id") Long id,
        @JsonProperty("readerName") String nomeLeitor,
        @JsonProperty("text") String texto,
        @JsonProperty("spoiler") boolean spoiler,
        @JsonProperty("mine") boolean meu,
        @JsonProperty("createdAt") Instant criadoEm
) {
}
