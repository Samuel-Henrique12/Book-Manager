package com.bookmanager.usuario.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// Entrada de Alteracao de Senha
public record AlterarSenhaRequestDTO(
        @NotBlank(message = "A senha atual é obrigatória")
        String senhaAtual,

        @NotBlank(message = "A nova senha é obrigatória")
        @Size(min = 4, max = 100, message = "A senha deve ter entre 4 e 100 caracteres")
        String novaSenha
) {
}
