package com.bookmanager.avaliacao;

import com.bookmanager.comum.auditoria.EntidadeAuditavel;
import com.bookmanager.livro.Livro;
import com.bookmanager.usuario.Usuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Entity da Avaliacao: Nota com Resenha Opcional
@Entity
@Table(name = "avaliacao")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = true)
public class Avaliacao extends EntidadeAuditavel {

    // EAGER Obrigatorio: o Alvo Usa @SoftDelete
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "livro_id", nullable = false)
    private Livro livro;

    @Column(nullable = false)
    private Short nota;

    @Column(name = "resenha", columnDefinition = "text")
    private String resenha;

    @Column(nullable = false)
    private boolean spoiler;

    public boolean temResenha() {
        return resenha != null && !resenha.isBlank();
    }
}
