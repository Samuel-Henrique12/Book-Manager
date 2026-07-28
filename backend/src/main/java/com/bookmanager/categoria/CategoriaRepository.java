package com.bookmanager.categoria;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

// Repository de Categorias
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    Optional<Categoria> findBySlug(String slug);

    // Apenas Categorias com Livros, Ordenadas pelo Tamanho do Acervo
    @Query("""
            SELECT c FROM Categoria c
             WHERE EXISTS (SELECT 1 FROM Livro l JOIN l.categorias lc WHERE lc = c)
             ORDER BY c.nome
            """)
    List<Categoria> listarComLivros();
}
