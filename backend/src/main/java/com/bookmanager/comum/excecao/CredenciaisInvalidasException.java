package com.bookmanager.comum.excecao;

// Credenciais Invalidas (401)
public class CredenciaisInvalidasException extends RuntimeException {

    public CredenciaisInvalidasException(String mensagem) {
        super(mensagem);
    }
}
