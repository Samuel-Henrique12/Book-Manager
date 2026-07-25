package com.bookmanager.autenticacao.dto;

// Resposta de Autenticacao
public record TokenRespostaDTO(
        String token,
        String tipo,
        long expiraEmSegundos
) {
}
