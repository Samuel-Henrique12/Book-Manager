package com.bookmanager.autenticacao.dto;

import jakarta.validation.constraints.NotBlank;

// Entrada com o Token do Link
public record TokenRequestDTO(
        @NotBlank(message = "O token é obrigatório")
        String token
) {
}
