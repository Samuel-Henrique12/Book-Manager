package com.bookmanager.livro;

import java.util.List;
import java.util.Map;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

// Traduz o sort do Contrato Publico (Ingles) para os Campos da Entidade (PT-BR)
final class OrdenacaoLivro {

    private static final Map<String, String> CAMPOS = Map.ofEntries(
            Map.entry("title", "titulo"),
            Map.entry("subtitle", "subtitulo"),
            Map.entry("author", "autor"),
            Map.entry("year", "ano"),
            Map.entry("description", "descricao"),
            Map.entry("isbn", "isbn"),
            Map.entry("pageCount", "totalPaginas"),
            Map.entry("publisher", "editora"),
            Map.entry("publishedDate", "dataPublicacao"),
            Map.entry("language", "idioma"),
            Map.entry("averageRating", "mediaAvaliacao"),
            Map.entry("ratingsCount", "totalAvaliacoes"),
            Map.entry("createdAt", "criadoEm"),
            Map.entry("updatedAt", "atualizadoEm"));

    private OrdenacaoLivro() {
    }

    // Campo Desconhecido Passa Direto e a Validacao do Spring Data Cuida do Resto
    static Pageable traduzir(Pageable paginacao) {
        if (paginacao.getSort().isUnsorted()) {
            return paginacao;
        }

        // nullsLast: sem isso o Postgres joga os Livros sem Nota para o Topo do "Melhor Avaliados"
        List<Sort.Order> ordens = paginacao.getSort().stream()
                .map(ordem -> ordem
                        .withProperty(CAMPOS.getOrDefault(ordem.getProperty(), ordem.getProperty()))
                        .nullsLast())
                .toList();

        return PageRequest.of(paginacao.getPageNumber(), paginacao.getPageSize(), Sort.by(ordens));
    }
}
