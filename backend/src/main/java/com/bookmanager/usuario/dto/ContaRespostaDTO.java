package com.bookmanager.usuario.dto;

import com.bookmanager.usuario.Perfil;
import java.time.Instant;

// Dados da Conta do Usuario Autenticado
public record ContaRespostaDTO(
        Long id,
        String nome,
        String email,
        Perfil perfil,
        boolean emailConfirmado,
        Instant criadoEm,
        boolean podeAdministrar
) {
}
