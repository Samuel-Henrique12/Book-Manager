package com.bookmanager.comum.config;

import com.bookmanager.autenticacao.seguranca.PropriedadesJwt;
import com.bookmanager.comum.email.PropriedadesEmail;
import jakarta.annotation.PostConstruct;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

// Barreira de Boot Contra Segredo Fraco
// Sem isso, Faltar JWT_SECRET Em Prod Faria a Aplicacao Subir Assinando
// Tokens Com Valor Publicado no Repository - Qualquer Um Forjaria Sessão
@Slf4j
@Component
@RequiredArgsConstructor
public class ValidadorDeSegredos {

    // Ausencia e Tamanho Minimo Ja Barrados no Binding de PropriedadesJwt.
    private static final String PERFIL_PRODUCAO = "prod";

    // Valores de Conveniencia que Vivem Versionados no Repositorio
    private static final Set<String> PLACEHOLDERS = Set.of(
            "trocar-secret-dev-com-32-bytes",
            "troque-este-segredo-de-desenvolvimento-com-no-minimo-32-bytes",
            "dev-apenas-nunca-use-isto-em-producao-0123456789",
            "exemplo-32-bytes",
            "changeme",
            "secret"
    );

    private final PropriedadesJwt propriedadesJwt;
    private final PropriedadesEmail propriedadesEmail;
    private final Environment ambiente;

    @PostConstruct
    void validar() {
        boolean producao = List.of(ambiente.getActiveProfiles()).contains(PERFIL_PRODUCAO);
        validarSegredoJwt(propriedadesJwt.secret(), producao);
        validarProvedorDeEmail(propriedadesEmail.provedor(), producao);
    }

    private void validarSegredoJwt(String segredo, boolean producao) {
        if (!PLACEHOLDERS.contains(segredo)) {
            return;
        }

        if (producao) {
            throw new IllegalStateException(
                    "JWT_SECRET está com o valor de exemplo do repositório e o perfil 'prod' está ativo. "
                            + "Defina um segredo próprio e aleatório na variável de ambiente.");
        }

        log.warn("JWT_SECRET está com o valor de desenvolvimento. Nunca suba isso em produção.");
    }

    private void validarProvedorDeEmail(String provedor, boolean producao) {
        if (producao && "smtp".equalsIgnoreCase(provedor)) {
            throw new IllegalStateException(
                    "EMAIL_PROVEDOR está como 'smtp' com o perfil 'prod' ativo, mas o plano free do Render "
                            + "bloqueia as portas SMTP. Defina EMAIL_PROVEDOR=brevo e MAIL_API_KEY.");
        }
    }
}
