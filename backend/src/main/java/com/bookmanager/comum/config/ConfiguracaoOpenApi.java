package com.bookmanager.comum.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

// Configuracao de Documentacao OpenAPI
@Configuration
public class ConfiguracaoOpenApi {

    private static final String ESQUEMA_JWT = "bearer-jwt";

    @Bean
    public OpenAPI apiBookManager() {
        return new OpenAPI()
                .info(new Info()
                        .title("Book Manager API")
                        .version("v1")
                        .description("API de gerenciamento de livros com autenticação JWT"))
                .components(new Components().addSecuritySchemes(ESQUEMA_JWT, new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")))
                .addSecurityItem(new SecurityRequirement().addList(ESQUEMA_JWT));
    }
}
