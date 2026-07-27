package com.bookmanager.comum.email;

import org.springframework.boot.context.properties.ConfigurationProperties;

// Configuracao de Envio de E-mail
@ConfigurationProperties(prefix = "app.email")
public record PropriedadesEmail(
        String provedor,
        String chaveApi,
        String remetente,
        String nomeRemetente,
        String urlBase
) {
    public PropriedadesEmail {
        if (provedor == null || provedor.isBlank()) {
            provedor = "smtp";
        }
        if (remetente == null || remetente.isBlank()) {
            remetente = "nao-responda@bookmanager.local";
        }
        if (nomeRemetente == null || nomeRemetente.isBlank()) {
            nomeRemetente = "Book Manager";
        }
        if (urlBase == null || urlBase.isBlank()) {
            urlBase = "http://localhost:3000";
        }
    }
}
