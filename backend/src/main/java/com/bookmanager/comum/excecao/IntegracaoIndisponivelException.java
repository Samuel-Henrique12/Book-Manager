package com.bookmanager.comum.excecao;

// Servico Externo Fora do Ar ou Recusando a Chamada
public class IntegracaoIndisponivelException extends RuntimeException {

    public IntegracaoIndisponivelException(String mensagem) {
        super(mensagem);
    }
}
