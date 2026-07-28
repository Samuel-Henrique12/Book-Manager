package com.bookmanager.livro;

import com.bookmanager.categoria.Categoria;
import com.bookmanager.comum.auditoria.EntidadeAuditavel;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.LinkedHashSet;
import java.util.Set;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.BatchSize;

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

    // Dados Vindos do Google Books
    @Column(name = "google_id", length = 64)
    private String googleId;

    @Column(name = "subtitulo", length = 300)
    private String subtitulo;

    @Column(name = "editora", length = 200)
    private String editora;

    @Column(name = "data_publicacao", length = 20)
    private String dataPublicacao;

    @Column(name = "idioma", length = 10)
    private String idioma;

    @Column(name = "media_avaliacao", precision = 2, scale = 1)
    private BigDecimal mediaAvaliacao;

    @Column(name = "total_avaliacoes")
    private Integer totalAvaliacoes;

    @Column(name = "link_previa", length = 500)
    private String linkPrevia;

    // Juncao Pura: LAZY com Carga em Lote Evita N+1 sem Paginar em Memoria
    @BatchSize(size = 50)
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "livro_categoria",
            joinColumns = @JoinColumn(name = "livro_id"),
            inverseJoinColumns = @JoinColumn(name = "categoria_id"))
    private Set<Categoria> categorias = new LinkedHashSet<>();
}
