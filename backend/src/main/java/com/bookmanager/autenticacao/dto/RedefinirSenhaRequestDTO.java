package com.bookmanager.autenticacao.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// Entrada de Redefinicao de Senha
public record RedefinirSenhaRequestDTO(
        @NotBlank(message = "O token é obrigatório")
        String token,

        @NotBlank(message = "A senha é obrigatória")
        @Size(min = 4, max = 100, message = "A senha deve ter entre 4 e 100 caracteres")
        String senha
) {
}
