package com.bookmanager.livro;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

// Repository de Livros
public interface LivroRepository extends JpaRepository<Livro, Long> {

    @Query("""
            SELECT l FROM Livro l
             WHERE LOWER(l.titulo) LIKE LOWER(:titulo)
               AND (:categoria = '' OR EXISTS (
                     SELECT 1 FROM Livro sub JOIN sub.categorias c
                      WHERE sub = l AND c.slug = :categoria))
            """)
    Page<Livro> buscar(@Param("titulo") String titulo, @Param("categoria") String categoria,
            Pageable paginacao);

    @EntityGraph(attributePaths = "categorias")
    Optional<Livro> findWithCategoriasById(Long id);

    Optional<Livro> findByGoogleId(String googleId);

    boolean existsByTituloIgnoreCaseAndAutorIgnoreCase(String titulo, String autor);
}
