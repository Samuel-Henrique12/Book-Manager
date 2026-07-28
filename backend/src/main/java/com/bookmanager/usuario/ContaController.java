package com.bookmanager.usuario;

import com.bookmanager.usuario.dto.AlterarSenhaRequestDTO;
import com.bookmanager.usuario.dto.AtualizarNomeRequestDTO;
import com.bookmanager.usuario.dto.ContaRespostaDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// Endpoints da Conta do Usuario
@RestController
@RequestMapping("/minha-conta")
@RequiredArgsConstructor
public class ContaController {

    private final UsuarioService usuarioService;

    // Endpoint para Obter os Dados da Propria Conta
    @GetMapping
    public ResponseEntity<ContaRespostaDTO> obter(@AuthenticationPrincipal UserDetails autenticado) {
        return ResponseEntity.ok(usuarioService.obterConta(autenticado.getUsername()));
    }

    // Endpoint para Alterar o Proprio Nome
    @PutMapping
    public ResponseEntity<ContaRespostaDTO> atualizar(@AuthenticationPrincipal UserDetails autenticado,
            @Valid @RequestBody AtualizarNomeRequestDTO requisicao) {
        return ResponseEntity.ok(usuarioService.atualizarConta(autenticado.getUsername(), requisicao));
    }

    // Endpoint para Alterar a Propria Senha
    @PutMapping("/senha")
    public ResponseEntity<Void> alterarSenha(@AuthenticationPrincipal UserDetails autenticado,
            @Valid @RequestBody AlterarSenhaRequestDTO requisicao) {
        usuarioService.alterarSenha(autenticado.getUsername(), requisicao);
        return ResponseEntity.noContent().build();
    }

    // Endpoint para Excluir a Propria Conta
    @DeleteMapping
    public ResponseEntity<Void> excluir(@AuthenticationPrincipal UserDetails autenticado) {
        usuarioService.excluirConta(autenticado.getUsername());
        return ResponseEntity.noContent().build();
    }
}
