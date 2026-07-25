package com.bookmanager.autenticacao.seguranca;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

// Configuracao Tipada do JWT
@ConfigurationProperties(prefix = "app.jwt")
public record PropriedadesJwt(
        String secret,
        Duration expiracao,
        String emissor
) {
}
