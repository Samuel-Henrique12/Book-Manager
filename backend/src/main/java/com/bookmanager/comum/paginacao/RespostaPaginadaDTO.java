package com.bookmanager.comum.paginacao;

import java.util.List;
import org.springframework.data.domain.Page;

// DTO pra Resposta Paginada
public record RespostaPaginadaDTO<T>(
        List<T> conteudo,
        int pagina,
        int tamanho,
        long totalElementos,
        int totalPaginas,
        boolean ultima
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
