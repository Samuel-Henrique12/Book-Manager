package com.bookmanager.autenticacao.dto;

// Resposta Que Ja Abre Sessão
// Usada em Redefinição e Confirmação de Email
public record SessaoRespostaDTO(
        String mensagem,
        String nome,
        String email,
        String token,
        String tipo,
        long expiraEmSegundos
) {
}
