package com.bookmanager.avaliacao;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

// Repository de Avaliacoes
public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Long> {

    Optional<Avaliacao> findByUsuarioIdAndLivroId(Long usuarioId, Long livroId);

    // Só Entram na Vitrine as Avaliacoes que Trazem Texto
    @Query("""
            SELECT a FROM Avaliacao a
             WHERE a.livro.id = :livroId AND a.resenha IS NOT NULL AND a.resenha <> ''
            """)
    Page<Avaliacao> listarResenhas(@Param("livroId") Long livroId, Pageable paginacao);

    // Ultimas Resenhas de Todo o Acervo, para o Feed da Home
    @Query("SELECT a FROM Avaliacao a WHERE a.resenha IS NOT NULL AND a.resenha <> ''")
    List<Avaliacao> listarUltimasResenhas(Pageable paginacao);

    // Media e Total da Comunidade para os Livros de Uma Pagina, sem N+1
    @Query("""
            SELECT a.livro.id, AVG(a.nota), COUNT(a)
              FROM Avaliacao a
             WHERE a.livro.id IN :livroIds
             GROUP BY a.livro.id
            """)
    List<Object[]> resumirPorLivros(@Param("livroIds") List<Long> livroIds);

    // Uma Consulta So para a Distribuicao das 5 Barras
    @Query("""
            SELECT a.nota, COUNT(a) FROM Avaliacao a
             WHERE a.livro.id = :livroId
             GROUP BY a.nota
            """)
    List<Object[]> contarPorNota(@Param("livroId") Long livroId);
}
