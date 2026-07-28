package com.bookmanager.usuario;

import com.bookmanager.comum.paginacao.RespostaPaginadaDTO;
import com.bookmanager.usuario.dto.AlterarPerfilRequestDTO;
import com.bookmanager.usuario.dto.AtualizarNomeRequestDTO;
import com.bookmanager.usuario.dto.UsuarioRespostaDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

// Endpoints de Administracao de Usuarios
@RestController
@RequestMapping("/usuarios")
@RequiredArgsConstructor
@PreAuthorize("@politicaAdmin.aberto() or hasRole('ADMIN')")
public class UsuarioController {

    private final UsuarioService usuarioService;

    // Endpoint para Listar Usuarios com Filtro por Nome ou E-mail e Paginação
    @GetMapping
    public ResponseEntity<RespostaPaginadaDTO<UsuarioRespostaDTO>> listar(
            @RequestParam(required = false) String busca,
            @PageableDefault(size = 10, sort = "nome") Pageable paginacao) {
        return ResponseEntity.ok(usuarioService.listar(busca, paginacao));
    }

    // Endpoint para Buscar Usuario por ID
    @GetMapping("/{id}")
    public ResponseEntity<UsuarioRespostaDTO> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.detalhar(id));
    }

    // Endpoint para Atualizar o Nome de um Usuario
    @PutMapping("/{id}")
    public ResponseEntity<UsuarioRespostaDTO> atualizar(@PathVariable Long id,
            @Valid @RequestBody AtualizarNomeRequestDTO requisicao) {
        return ResponseEntity.ok(usuarioService.atualizarUsuario(id, requisicao));
    }

    // Endpoint para Trocar o Perfil de Acesso de um Usuario
    @PatchMapping("/{id}/perfil")
    public ResponseEntity<UsuarioRespostaDTO> alterarPerfil(@PathVariable Long id,
            @Valid @RequestBody AlterarPerfilRequestDTO requisicao) {
        return ResponseEntity.ok(usuarioService.alterarPerfil(id, requisicao));
    }

    // Endpoint para Remover Usuario por ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable Long id,
            @AuthenticationPrincipal UserDetails autenticado) {
        usuarioService.removerUsuario(id, autenticado.getUsername());
        return ResponseEntity.noContent().build();
    }
}
