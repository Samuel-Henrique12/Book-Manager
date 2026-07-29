package com.bookmanager.comentario;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

// Repository de Comentarios
public interface ComentarioRepository extends JpaRepository<Comentario, Long> {

    Page<Comentario> findByLivroId(Long livroId, Pageable paginacao);
}
