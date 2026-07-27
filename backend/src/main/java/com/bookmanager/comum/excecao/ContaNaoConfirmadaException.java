package com.bookmanager.comum.excecao;

// Conta com E-mail Ainda Nao Confirmado
public class ContaNaoConfirmadaException extends RuntimeException {

    public ContaNaoConfirmadaException(String mensagem) {
        super(mensagem);
    }
}
