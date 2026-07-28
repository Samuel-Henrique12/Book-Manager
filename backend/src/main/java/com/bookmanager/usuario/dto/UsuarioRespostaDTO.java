package com.bookmanager.usuario.dto;

import com.bookmanager.usuario.Perfil;
import java.time.Instant;

// Detalhe de Usuario
public record UsuarioRespostaDTO(
        Long id,
        String nome,
        String email,
        Perfil perfil,
        boolean emailConfirmado,
        Instant criadoEm
) {
}
