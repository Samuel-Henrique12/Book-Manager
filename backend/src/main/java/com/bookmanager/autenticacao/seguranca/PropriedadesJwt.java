package com.bookmanager.autenticacao.seguranca;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

// Configuracao Tipada do JWT
@ConfigurationProperties(prefix = "app.jwt")
public record PropriedadesJwt(
        String secret,
        Duration expiracao,
        String emissor
) {

    private static final int MINIMO_DE_BYTES = 32;

    public PropriedadesJwt {
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException(
                    "JWT_SECRET não foi definido. Configure a variável de ambiente antes de iniciar a aplicação.");
        }

        int bytes = secret.getBytes(StandardCharsets.UTF_8).length;
        if (bytes < MINIMO_DE_BYTES) {
            throw new IllegalStateException(
                    "JWT_SECRET tem apenas %d bytes; o mínimo é %d. Gere um segredo aleatório mais longo."
                            .formatted(bytes, MINIMO_DE_BYTES));
        }
    }
}
