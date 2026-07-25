package com.bookmanager.autenticacao.dto;

import jakarta.validation.constraints.NotBlank;

// Dados de Login
public record LoginRequestDTO(
        @NotBlank(message = "O e-mail é obrigatório")
        String email,

        @NotBlank(message = "A senha é obrigatória")
        String senha
) {
}
