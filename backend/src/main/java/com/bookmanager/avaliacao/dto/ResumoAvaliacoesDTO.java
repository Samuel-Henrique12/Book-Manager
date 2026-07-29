package com.bookmanager.avaliacao.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.util.List;

// Nota da Comunidade e Distribuicao das 5 Barras
public record ResumoAvaliacoesDTO(
        @JsonProperty("average") BigDecimal media,
        @JsonProperty("total") long total,
        @JsonProperty("distribution") List<FatiaNota> distribuicao
) {

    // Uma Barra: Quantidade e Percentual da Nota
    public record FatiaNota(
            @JsonProperty("rating") int nota,
            @JsonProperty("count") long quantidade,
            @JsonProperty("percentage") int percentual
    ) {
    }
}
