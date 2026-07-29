package com.bookmanager.estante;

import com.bookmanager.comum.auditoria.EntidadeAuditavel;
import com.bookmanager.livro.Livro;
import com.bookmanager.usuario.Usuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Entity da Estante: Vinculo entre Leitor e Livro
@Entity
@Table(name = "estante")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = true)
public class Estante extends EntidadeAuditavel {

    // EAGER Obrigatorio: o Alvo Usa @SoftDelete
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "livro_id", nullable = false)
    private Livro livro;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusLeitura status;

    @Column(nullable = false)
    private boolean favorito;

    @Column(name = "pagina_atual")
    private Integer paginaAtual;

    // Vale Só Quando o Livro Nao Traz o Total do Google
    @Column(name = "total_paginas")
    private Integer totalPaginas;

    // O Total do Proprio Livro Tem Prioridade Sobre o Informado a Mao
    public Integer totalDePaginas() {
        return livro.getTotalPaginas() != null ? livro.getTotalPaginas() : totalPaginas;
    }

    // Livro Lido Conta Integral; Em Leitura Conta o que Ja Foi Lido
    public int paginasLidas() {
        Integer total = totalDePaginas();
        if (status == StatusLeitura.LIDO) {
            return total != null ? total : 0;
        }
        if (status == StatusLeitura.LENDO && paginaAtual != null) {
            return total != null ? Math.min(paginaAtual, total) : paginaAtual;
        }
        return 0;
    }
}
