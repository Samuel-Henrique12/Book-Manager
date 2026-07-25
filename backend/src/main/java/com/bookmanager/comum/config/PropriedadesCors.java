package com.bookmanager.comum.config;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

// Origens Permitidas para CORS
@ConfigurationProperties(prefix = "app.cors")
public record PropriedadesCors(List<String> origens) {
}
