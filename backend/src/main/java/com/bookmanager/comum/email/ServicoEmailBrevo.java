package com.bookmanager.comum.email;

import com.bookmanager.comum.excecao.FalhaNoEnvioDeEmailException;
import jakarta.annotation.PostConstruct;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

// Envio pela API HTTP da Brevo — usado em producao
@Slf4j
@Service
@ConditionalOnProperty(name = "app.email.provedor", havingValue = "brevo")
public class ServicoEmailBrevo implements ServicoEmail {

    private static final String ENDPOINT = "https://api.brevo.com/v3/smtp/email";

    private final PropriedadesEmail propriedades;
    private final ModeloEmail modelo;
    private final RestClient cliente;

    public ServicoEmailBrevo(PropriedadesEmail propriedades, ModeloEmail modelo) {
        this.propriedades = propriedades;
        this.modelo = modelo;

        SimpleClientHttpRequestFactory fabrica = new SimpleClientHttpRequestFactory();
        fabrica.setConnectTimeout(Duration.ofSeconds(5));
        fabrica.setReadTimeout(Duration.ofSeconds(10));

        this.cliente = RestClient.builder()
                .requestFactory(fabrica)
                .baseUrl(ENDPOINT)
                .defaultHeader("accept", "application/json")
                .defaultHeader("content-type", "application/json")
                .build();
    }

    @PostConstruct
    void validarConfiguracao() {
        if (propriedades.chaveApi() == null || propriedades.chaveApi().isBlank()) {
            throw new IllegalStateException(
                    "app.email.provedor está como 'brevo', mas MAIL_API_KEY não foi definida.");
        }
    }

    @Override
    public void enviarConfirmacaoDeConta(String destinatario, String nome, String token) {
        enviar(destinatario, nome, modelo.confirmacaoDeConta(nome, token));
    }

    @Override
    public void enviarRedefinicaoDeSenha(String destinatario, String nome, String token) {
        enviar(destinatario, nome, modelo.redefinicaoDeSenha(nome, token));
    }

    private void enviar(String destinatario, String nome, ModeloEmail.Mensagem mensagem) {
        Map<String, Object> corpo = Map.of(
                "sender", Map.of("name", propriedades.nomeRemetente(), "email", propriedades.remetente()),
                "to", List.of(Map.of("email", destinatario, "name", nome)),
                "subject", mensagem.assunto(),
                "htmlContent", mensagem.html());

        try {
            cliente.post()
                    // A chave Não Entra Em Log, Fica Só no Header
                    .header("api-key", propriedades.chaveApi())
                    .body(corpo)
                    .retrieve()
                    .toBodilessEntity();
            log.info("E-mail '{}' enviado pela Brevo", mensagem.assunto());
        } catch (RestClientException ex) {
            log.error("Falha ao enviar e-mail '{}' pela Brevo", mensagem.assunto(), ex);
            throw new FalhaNoEnvioDeEmailException(
                    "Não foi possível enviar o e-mail agora. Tente novamente em alguns instantes.");
        }
    }
}
