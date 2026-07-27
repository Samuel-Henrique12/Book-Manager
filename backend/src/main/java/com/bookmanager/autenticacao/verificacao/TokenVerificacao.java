package com.bookmanager.autenticacao.verificacao;

import com.bookmanager.comum.auditoria.EntidadeAuditavel;
import com.bookmanager.usuario.Usuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Token de Confirmacao de E-mail ou Redefinicao de Senha
@Entity
@Table(name = "token_verificacao")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
public class TokenVerificacao extends EntidadeAuditavel {

    // EAGER obrigatorio: o alvo usa @SoftDelete
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @EqualsAndHashCode.Include
    @Column(name = "token_hash", nullable = false, length = 64)
    private String tokenHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TipoToken tipo;

    @Column(name = "expira_em", nullable = false)
    private Instant expiraEm;

    @Column(name = "usado_em")
    private Instant usadoEm;

    public boolean expirado() {
        return Instant.now().isAfter(expiraEm);
    }

    public boolean utilizado() {
        return usadoEm != null;
    }
}
