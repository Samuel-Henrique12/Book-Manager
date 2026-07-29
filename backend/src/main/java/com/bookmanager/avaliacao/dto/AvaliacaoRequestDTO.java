package com.bookmanager.avaliacao.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

// Entrada de Avaliacao: Nota Obrigatoria, Resenha Opcional
public record AvaliacaoRequestDTO(
        @JsonProperty("rating")
        @NotNull(message = "A nota é obrigatória")
        @Min(value = 1, message = "A nota vai de 1 a 5")
        @Max(value = 5, message = "A nota vai de 1 a 5")
        Short nota,

        @JsonProperty("review")
        @Size(max = 5000, message = "A resenha deve ter no máximo 5000 caracteres")
        String resenha,

        @JsonProperty("spoiler")
        boolean spoiler
) {
}
