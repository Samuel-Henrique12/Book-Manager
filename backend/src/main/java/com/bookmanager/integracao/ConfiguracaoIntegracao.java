package com.bookmanager.integracao;

import java.net.http.HttpClient;
import java.time.Duration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.web.client.RestClient;

// Habilita a Importacao em Segundo Plano e Monta o Cliente HTTP
@Configuration
@EnableAsync
@EnableConfigurationProperties(PropriedadesGoogleBooks.class)
public class ConfiguracaoIntegracao {

    private static final Duration TEMPO_DE_CONEXAO = Duration.ofSeconds(5);
    private static final Duration TEMPO_DE_LEITURA = Duration.ofSeconds(15);

    // Chamada Externa Nunca Fica sem Timeout
    @Bean
    RestClient clienteGoogleBooks(PropriedadesGoogleBooks propriedades, RestClient.Builder construtor) {
        JdkClientHttpRequestFactory fabrica = new JdkClientHttpRequestFactory(
                HttpClient.newBuilder().connectTimeout(TEMPO_DE_CONEXAO).build());
        fabrica.setReadTimeout(TEMPO_DE_LEITURA);

        return construtor
                .requestFactory(fabrica)
                .baseUrl(propriedades.urlBase())
                .defaultHeader("accept", "application/json")
                .build();
    }
}
