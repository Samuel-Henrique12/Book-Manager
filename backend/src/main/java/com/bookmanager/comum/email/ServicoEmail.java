package com.bookmanager.comum.email;

// Porta de Envio de E-mail
public interface ServicoEmail {

    void enviarConfirmacaoDeConta(String destinatario, String nome, String token);

    void enviarRedefinicaoDeSenha(String destinatario, String nome, String token);
}
