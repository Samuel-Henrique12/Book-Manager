package com.bookmanager.autenticacao;

import com.bookmanager.autenticacao.dto.LoginRequestDTO;
import com.bookmanager.autenticacao.dto.RegistroRequestDTO;
import com.bookmanager.autenticacao.dto.TokenRespostaDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// Endpoints de Autenticação (Registro e Login)
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AutenticacaoController {

    private final AutenticacaoService autenticacaoService;

    // Endpoint para Registro de Novo Usuario
    @PostMapping("/register")
    public ResponseEntity<TokenRespostaDTO> registrar(@Valid @RequestBody RegistroRequestDTO requisicao) {
        return ResponseEntity.status(HttpStatus.CREATED).body(autenticacaoService.registrar(requisicao));
    }

    // Endpoint para Login
    @PostMapping("/login")
    public ResponseEntity<TokenRespostaDTO> login(@Valid @RequestBody LoginRequestDTO requisicao) {
        return ResponseEntity.ok(autenticacaoService.login(requisicao));
    }
}
