package com.bookmanager.autenticacao.seguranca;

import com.bookmanager.usuario.Perfil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

// Politica de Acesso a Administracao de Usuarios
@Component
@RequiredArgsConstructor
public class PoliticaAdmin {

    private final PropriedadesAdmin propriedades;
    public boolean aberto() {
        return propriedades.aberto();
    }
    public boolean permitido(Perfil perfil) {
        return aberto() || perfil == Perfil.ADMIN;
    }
}
