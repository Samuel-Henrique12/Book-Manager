package com.bookmanager.integracao.dto;

// Acompanhamento da Importacao em Andamento
public record ProgressoImportacaoDTO(
        boolean emAndamento,
        int importados,
        int ignorados,
        int falhas,
        String temaAtual,
        int temasConcluidos,
        int totalTemas,
        String mensagem
) {
}
