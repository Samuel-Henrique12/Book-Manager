package com.bookmanager.comum.excecao;

// Falha de Infraestrutura no Envio de E-mail
public class FalhaNoEnvioDeEmailException extends RuntimeException {

    public FalhaNoEnvioDeEmailException(String mensagem) {
        super(mensagem);
    }
}
