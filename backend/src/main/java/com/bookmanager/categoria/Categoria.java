package com.bookmanager.categoria;

import com.bookmanager.comum.auditoria.EntidadeAuditavel;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Entity da Categoria
@Entity
@Table(name = "categoria")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
public class Categoria extends EntidadeAuditavel {

    @Column(nullable = false, length = 120)
    private String nome;

    @EqualsAndHashCode.Include
    @Column(nullable = false, length = 120)
    private String slug;

    public Categoria(String nome, String slug) {
        this.nome = nome;
        this.slug = slug;
    }
}
