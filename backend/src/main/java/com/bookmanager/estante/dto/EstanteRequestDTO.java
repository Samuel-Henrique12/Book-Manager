package com.bookmanager.estante.dto;

import com.bookmanager.estante.StatusLeitura;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

// Entrada da Estante: Status, Favorito e Progresso
public record EstanteRequestDTO(
        @JsonProperty("status")
        @NotNull(message = "O status de leitura é obrigatório")
        StatusLeitura status,

        @JsonProperty("favorite")
        boolean favorito,

        @JsonProperty("currentPage")
        @Min(value = 0, message = "A página atual não pode ser negativa")
        Integer paginaAtual,

        @JsonProperty("totalPages")
        @Min(value = 1, message = "O total de páginas deve ser maior que zero")
        Integer totalPaginas
) {
}
