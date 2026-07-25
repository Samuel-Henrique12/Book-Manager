package com.bookmanager.comum.auditoria;

import java.util.Optional;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

// Provider do Usuario Atual pra Auditoria de Entitys
@Component
public class AuditorAwareImpl implements AuditorAware<String> {

    private static final String AUDITOR_SISTEMA = "sistema";

    // Retorna o Usuario Atual ou do Sistema (Se Não Tiver Usuário Autenticado)
    @Override
    public Optional<String> getCurrentAuditor() {
        Authentication autenticacao = SecurityContextHolder.getContext().getAuthentication();
        if (autenticacao == null || !autenticacao.isAuthenticated()
                || "anonymousUser".equals(autenticacao.getPrincipal())) {
            return Optional.of(AUDITOR_SISTEMA);
        }
        return Optional.of(autenticacao.getName());
    }
}
