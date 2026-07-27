package com.bookmanager.autenticacao.verificacao;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

// Validade dos Tokens de Verificacao
@ConfigurationProperties(prefix = "app.verificacao")
public record PropriedadesVerificacao(
        Duration validadeConfirmacao,
        Duration validadeRedefinicao
) {
    public PropriedadesVerificacao {
        if (validadeConfirmacao == null) {
            validadeConfirmacao = Duration.ofHours(24);
        }
        if (validadeRedefinicao == null) {
            validadeRedefinicao = Duration.ofHours(1);
        }
    }

    public Duration validadePara(TipoToken tipo) {
        return tipo == TipoToken.CONFIRMACAO_EMAIL ? validadeConfirmacao : validadeRedefinicao;
    }
}
