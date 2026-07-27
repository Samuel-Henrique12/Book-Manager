package com.bookmanager.comum.email;

import com.bookmanager.comum.excecao.FalhaNoEnvioDeEmailException;
import jakarta.mail.internet.MimeMessage;
import java.io.UnsupportedEncodingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

// Envio por SMTP — Usado no Dev com MailPit
@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.email.provedor", havingValue = "smtp", matchIfMissing = true)
public class ServicoEmailSmtp implements ServicoEmail {

    private final JavaMailSender remetenteDeEmail;
    private final PropriedadesEmail propriedades;
    private final ModeloEmail modelo;

    @Override
    public void enviarConfirmacaoDeConta(String destinatario, String nome, String token) {
        enviar(destinatario, modelo.confirmacaoDeConta(nome, token));
    }

    @Override
    public void enviarRedefinicaoDeSenha(String destinatario, String nome, String token) {
        enviar(destinatario, modelo.redefinicaoDeSenha(nome, token));
    }

    private void enviar(String destinatario, ModeloEmail.Mensagem mensagem) {
        try {
            MimeMessage mime = remetenteDeEmail.createMimeMessage();
            MimeMessageHelper ajudante = new MimeMessageHelper(mime, "UTF-8");
            ajudante.setFrom(propriedades.remetente(), propriedades.nomeRemetente());
            ajudante.setTo(destinatario);
            ajudante.setSubject(mensagem.assunto());
            ajudante.setText(mensagem.html(), true);
            remetenteDeEmail.send(mime);
            log.info("E-mail '{}' enviado por SMTP", mensagem.assunto());
        } catch (MailException | jakarta.mail.MessagingException | UnsupportedEncodingException ex) {
            log.error("Falha ao enviar e-mail '{}' por SMTP", mensagem.assunto(), ex);
            throw new FalhaNoEnvioDeEmailException(
                    "Não foi possível enviar o e-mail agora. Tente novamente em alguns instantes.");
        }
    }
}
