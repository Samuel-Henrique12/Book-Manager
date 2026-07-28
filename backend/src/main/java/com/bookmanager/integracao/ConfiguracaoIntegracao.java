package com.bookmanager.integracao;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

// Habilita a Importacao em Segundo Plano
@Configuration
@EnableAsync
@EnableConfigurationProperties(PropriedadesGoogleBooks.class)
public class ConfiguracaoIntegracao {
}
