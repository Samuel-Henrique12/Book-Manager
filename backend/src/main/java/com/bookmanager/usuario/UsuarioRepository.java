package com.bookmanager.usuario;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

// Repository de Usuarios
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);
}
