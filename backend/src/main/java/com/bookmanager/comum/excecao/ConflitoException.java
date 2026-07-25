package com.bookmanager.comum.excecao;

// Conflito de Estado (409)
public class ConflitoException extends RuntimeException {

    public ConflitoException(String mensagem) {
        super(mensagem);
    }
}
