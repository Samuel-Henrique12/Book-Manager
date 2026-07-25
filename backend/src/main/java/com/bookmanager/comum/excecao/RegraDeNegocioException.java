package com.bookmanager.comum.excecao;

// Violacao de Regra de Negocio (422)
public class RegraDeNegocioException extends RuntimeException {

    public RegraDeNegocioException(String mensagem) {
        super(mensagem);
    }
}
