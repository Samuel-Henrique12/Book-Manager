package com.bookmanager.livro.dto;

import com.bookmanager.categoria.dto.CategoriaRespostaDTO;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

// Detalhe de Livro
public record LivroRespostaDTO(
        Long id,
        String titulo,
        String subtitulo,
        String autor,
        Integer ano,
        String descricao,
        String urlCapa,
        String isbn,
        Integer totalPaginas,
        String editora,
        String dataPublicacao,
        String idioma,
        BigDecimal mediaAvaliacao,
        Integer totalAvaliacoes,
        String linkPrevia,
        List<CategoriaRespostaDTO> categorias,
        Instant criadoEm,
        Instant atualizadoEm
) {
}
