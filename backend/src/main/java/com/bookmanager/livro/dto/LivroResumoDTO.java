package com.bookmanager.livro.dto;

import com.bookmanager.categoria.dto.CategoriaRespostaDTO;
import java.math.BigDecimal;
import java.util.List;

// Resumo de Livro para Listagem
public record LivroResumoDTO(
        Long id,
        String titulo,
        String autor,
        Integer ano,
        String descricao,
        String urlCapa,
        BigDecimal mediaAvaliacao,
        Integer totalAvaliacoes,
        List<CategoriaRespostaDTO> categorias
) {
}
