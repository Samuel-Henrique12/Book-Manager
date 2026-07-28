package com.bookmanager.integracao.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.math.BigDecimal;
import java.util.List;

// Recorte da Resposta do Google Books
@JsonIgnoreProperties(ignoreUnknown = true)
public record VolumeGoogleDTO(String id, InformacoesVolume volumeInfo) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record InformacoesVolume(
            String title,
            String subtitle,
            List<String> authors,
            String publisher,
            String publishedDate,
            String description,
            List<Identificador> industryIdentifiers,
            Integer pageCount,
            List<String> categories,
            BigDecimal averageRating,
            Integer ratingsCount,
            String language,
            Imagens imageLinks,
            String previewLink
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Identificador(String type, String identifier) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Imagens(String smallThumbnail, String thumbnail) {
    }

    // Envelope da Busca por Volumes
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Pagina(Integer totalItems, List<VolumeGoogleDTO> items) {
    }
}
