package com.bookmanager.comum.excecao;

// Token JWT Invalido ou Expirado (401)
public class TokenInvalidoException extends RuntimeException {

    public TokenInvalidoException(String mensagem) {
        super(mensagem);
    }
}
