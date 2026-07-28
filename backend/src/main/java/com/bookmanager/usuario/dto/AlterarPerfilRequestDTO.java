package com.bookmanager.usuario.dto;

import com.bookmanager.usuario.Perfil;
import jakarta.validation.constraints.NotNull;

// Entrada de Troca de Perfil de Acesso
public record AlterarPerfilRequestDTO(
        @NotNull(message = "O perfil é obrigatório")
        Perfil perfil
) {
}
