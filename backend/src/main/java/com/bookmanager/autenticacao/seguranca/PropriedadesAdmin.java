package com.bookmanager.autenticacao.seguranca;

import org.springframework.boot.context.properties.ConfigurationProperties;

// Configuracao de Acesso Administrativo
@ConfigurationProperties(prefix = "app.admin")
public record PropriedadesAdmin(boolean aberto) {
}
