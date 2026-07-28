package com.bookmanager.comum.paginacao;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import org.springframework.data.domain.Page;

// DTO pra Resposta Paginada — Nomes Espelham o Page do Spring Data
public record RespostaPaginadaDTO<T>(
        @JsonProperty("content") List<T> conteudo,
        @JsonProperty("page") int pagina,
        @JsonProperty("size") int tamanho,
        @JsonProperty("totalElements") long totalElementos,
        @JsonProperty("totalPages") int totalPaginas,
        @JsonProperty("last") boolean ultima
) {

    // Static Constructor pra Criar DTO a Partir de uma Página do Spring Data
    public static <T> RespostaPaginadaDTO<T> de(Page<T> pagina) {
        return new RespostaPaginadaDTO<>(
                pagina.getContent(),
                pagina.getNumber(),
                pagina.getSize(),
                pagina.getTotalElements(),
                pagina.getTotalPages(),
                pagina.isLast());
    }
}
