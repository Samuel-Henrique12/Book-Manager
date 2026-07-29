package com.bookmanager.comentario;

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

// Entity do Comentario: Conversa Livre no Livro
@Entity
@Table(name = "comentario")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = true)
public class Comentario extends EntidadeAuditavel {

    // EAGER Obrigatorio: o Alvo Usa @SoftDelete
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "livro_id", nullable = false)
    private Livro livro;

    @Column(name = "texto", nullable = false, columnDefinition = "text")
    private String texto;

    @Column(nullable = false)
    private boolean spoiler;
}
