package com.bookmanager.categoria;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

// Repository de Categorias
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    Optional<Categoria> findBySlug(String slug);

    // Categorias com Volume Minimo de Livros, das Maiores para as Menores
    @Query("""
            SELECT c.id, c.nome, c.slug, COUNT(l)
              FROM Categoria c JOIN Livro l ON c MEMBER OF l.categorias
             GROUP BY c.id, c.nome, c.slug
            HAVING COUNT(l) >= :minimo
             ORDER BY COUNT(l) DESC, c.nome
            """)
    List<Object[]> listarComLivros(@Param("minimo") long minimo);
}
