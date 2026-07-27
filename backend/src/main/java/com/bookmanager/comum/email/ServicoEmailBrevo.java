package com.bookmanager.comum.email;

import com.bookmanager.comum.excecao.FalhaNoEnvioDeEmailException;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.net.http.HttpClient;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

// Envio pela API HTTP da Brevo — usado em producao
@Slf4j
@Service
@ConditionalOnProperty(name = "app.email.provedor", havingValue = "brevo")
public class ServicoEmailBrevo implements ServicoEmail {

    private static final String ENDPOINT = "https://api.brevo.com/v3/smtp/email";

    // O motivo real vai para o log; o cliente recebe sempre a mesma frase
    private static final String MENSAGEM_GENERICA =
            "Não foi possível enviar o e-mail agora. Tente novamente em alguns instantes.";

    private final PropriedadesEmail propriedades;
    private final ModeloEmail modelo;
    private final RestClient cliente;

    public ServicoEmailBrevo(PropriedadesEmail propriedades, ModeloEmail modelo) {
        this.propriedades = propriedades;
        this.modelo = modelo;

        // Cliente do JDK: o SimpleClientHttpRequestFactory nao entrega o corpo das
        // respostas de erro, e e justamente nele que a Brevo diz o motivo da recusa.
        JdkClientHttpRequestFactory fabrica = new JdkClientHttpRequestFactory(
                HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build());
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
                    .exchange((requisicao, resposta) -> {
                        HttpStatusCode status = resposta.getStatusCode();
                        if (status.is2xxSuccessful()) {
                            log.info("E-mail '{}' aceito pela Brevo (HTTP {})",
                                    mensagem.assunto(), status.value());
                            return true;
                        }
                        log.error("Brevo recusou o envio de '{}' — HTTP {} — remetente '{}' — resposta: {}",
                                mensagem.assunto(), status.value(), propriedades.remetente(),
                                lerCorpo(resposta));
                        throw new FalhaNoEnvioDeEmailException(MENSAGEM_GENERICA);
                    }, false);
        } catch (RestClientException ex) {
            log.error("Falha de rede ao falar com a Brevo ao enviar '{}'", mensagem.assunto(), ex);
            throw new FalhaNoEnvioDeEmailException(MENSAGEM_GENERICA);
        }
    }

    private String lerCorpo(RestClient.RequestHeadersSpec.ConvertibleClientHttpResponse resposta) {
        try (InputStream fluxo = resposta.getBody()) {
            String corpo = new String(fluxo.readAllBytes(), StandardCharsets.UTF_8).trim();
            return corpo.isEmpty() ? "(sem corpo)" : corpo;
        } catch (IOException ex) {
            return "(não foi possível ler o corpo: " + ex.getMessage() + ")";
        }
    }
}
