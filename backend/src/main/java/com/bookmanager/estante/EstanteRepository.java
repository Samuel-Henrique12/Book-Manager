package com.bookmanager.estante;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

// Repository da Estante
public interface EstanteRepository extends JpaRepository<Estante, Long> {

    Optional<Estante> findByUsuarioIdAndLivroId(Long usuarioId, Long livroId);

    // Alimenta as Fitas da Grade sem N+1
    List<Estante> findByUsuarioIdAndLivroIdIn(Long usuarioId, List<Long> livroIds);

    Page<Estante> findByUsuarioId(Long usuarioId, Pageable paginacao);

    Page<Estante> findByUsuarioIdAndStatus(Long usuarioId, StatusLeitura status, Pageable paginacao);

    Page<Estante> findByUsuarioIdAndFavoritoTrue(Long usuarioId, Pageable paginacao);

    long countByUsuarioIdAndFavoritoTrue(Long usuarioId);

    @Query("SELECT e.status, COUNT(e) FROM Estante e WHERE e.usuario.id = :usuarioId GROUP BY e.status")
    List<Object[]> contarPorStatus(@Param("usuarioId") Long usuarioId);

    // Paginometro: Livro Lido Conta o Total; o do Google Tem Prioridade
    @Query("""
            SELECT COALESCE(SUM(COALESCE(e.livro.totalPaginas, e.totalPaginas)), 0)
              FROM Estante e
             WHERE e.usuario.id = :usuarioId AND e.status = com.bookmanager.estante.StatusLeitura.LIDO
            """)
    long somarPaginasLidas(@Param("usuarioId") Long usuarioId);
}
