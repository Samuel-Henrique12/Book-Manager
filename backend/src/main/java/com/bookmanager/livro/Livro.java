package com.bookmanager.livro;

import com.bookmanager.comum.auditoria.EntidadeAuditavel;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Entity do Livro
@Entity
@Table(name = "livro")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = true)
public class Livro extends EntidadeAuditavel {

    @Column(nullable = false, length = 250)
    private String titulo;

    @Column(nullable = false, length = 200)
    private String autor;

    @Column(name = "ano")
    private Integer ano;

    @Column(name = "descricao", columnDefinition = "text")
    private String descricao;

    @Column(name = "url_capa", length = 500)
    private String urlCapa;

    @Column(name = "isbn", length = 20)
    private String isbn;

    @Column(name = "total_paginas")
    private Integer totalPaginas;
}
