package com.bookmanager.comum.auditoria;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

// Configuração de Auditoria JPA
@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorAwareImpl")
public class ConfiguracaoJpaAuditing {
}
