package com.bookmanager.estante.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

// Contadores da Estante e o Paginometro
public record ResumoEstanteDTO(
        @JsonProperty("wantToRead") long queroLer,
        @JsonProperty("reading") long lendo,
        @JsonProperty("read") long lidos,
        @JsonProperty("abandoned") long abandonados,
        @JsonProperty("favorites") long favoritos,
        @JsonProperty("total") long total,
        @JsonProperty("pagesRead") long paginasLidas
) {
}
