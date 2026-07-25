package com.bookmanager.comum.excecao;

// Recurso Inexistente (404)
public class RecursoNaoEncontradoException extends RuntimeException {

    public RecursoNaoEncontradoException(String mensagem) {
        super(mensagem);
    }
}
