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
        provedor = limpar(provedor);
        chaveApi = limpar(chaveApi);
        remetente = limpar(remetente);
        nomeRemetente = limpar(nomeRemetente);
        urlBase = limpar(urlBase);

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

    private static String limpar(String valor) {
        return valor == null ? null : valor.strip();
    }
}
