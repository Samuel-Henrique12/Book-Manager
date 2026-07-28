package com.bookmanager.autenticacao.verificacao;

import com.bookmanager.usuario.Usuario;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

// Repository de Tokens de Verificacao
public interface TokenVerificacaoRepository extends JpaRepository<TokenVerificacao, Long> {

    Optional<TokenVerificacao> findByTokenHashAndTipo(String tokenHash, TipoToken tipo);

    // Invalida os Pendentes ao Emitir um Novo
    @Modifying
    @Query("""
            UPDATE TokenVerificacao t
               SET t.usadoEm = CURRENT_TIMESTAMP
             WHERE t.usuario = :usuario
               AND t.tipo = :tipo
               AND t.usadoEm IS NULL
            """)
    void invalidarPendentes(@Param("usuario") Usuario usuario, @Param("tipo") TipoToken tipo);

    // Invalida Todos os Pendentes ao Excluir a Conta
    @Modifying
    @Query("""
            UPDATE TokenVerificacao t
               SET t.usadoEm = CURRENT_TIMESTAMP
             WHERE t.usuario = :usuario
               AND t.usadoEm IS NULL
            """)
    void invalidarTodosDoUsuario(@Param("usuario") Usuario usuario);
}
