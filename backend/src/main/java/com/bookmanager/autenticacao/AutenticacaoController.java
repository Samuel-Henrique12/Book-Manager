package com.bookmanager.autenticacao;

import com.bookmanager.autenticacao.dto.EmailRequestDTO;
import com.bookmanager.autenticacao.dto.LoginRequestDTO;
import com.bookmanager.autenticacao.dto.MensagemRespostaDTO;
import com.bookmanager.autenticacao.dto.RedefinirSenhaRequestDTO;
import com.bookmanager.autenticacao.dto.RegistroRequestDTO;
import com.bookmanager.autenticacao.dto.SessaoRespostaDTO;
import com.bookmanager.autenticacao.dto.TokenRequestDTO;
import com.bookmanager.autenticacao.dto.TokenRespostaDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// Endpoints de Autenticacao
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AutenticacaoController {

    private final AutenticacaoService autenticacaoService;

    // Registro de Nova Conta
    @PostMapping("/register")
    public ResponseEntity<MensagemRespostaDTO> registrar(@Valid @RequestBody RegistroRequestDTO requisicao) {
        return ResponseEntity.status(HttpStatus.CREATED).body(autenticacaoService.registrar(requisicao));
    }

    // Login
    @PostMapping("/login")
    public ResponseEntity<TokenRespostaDTO> login(@Valid @RequestBody LoginRequestDTO requisicao) {
        return ResponseEntity.ok(autenticacaoService.login(requisicao));
    }

    // Confirmacao de E-mail — Volta na Sessão
    @PostMapping("/confirmar")
    public ResponseEntity<SessaoRespostaDTO> confirmar(@Valid @RequestBody TokenRequestDTO requisicao) {
        return ResponseEntity.ok(autenticacaoService.confirmarEmail(requisicao));
    }

    // Reenvio da Confirmacao
    @PostMapping("/reenviar-confirmacao")
    public ResponseEntity<MensagemRespostaDTO> reenviar(@Valid @RequestBody EmailRequestDTO requisicao) {
        return ResponseEntity.ok(autenticacaoService.reenviarConfirmacao(requisicao));
    }

    // Pedido de Redefinicao de Senha
    @PostMapping("/senha/esqueci")
    public ResponseEntity<MensagemRespostaDTO> esqueciSenha(@Valid @RequestBody EmailRequestDTO requisicao) {
        return ResponseEntity.ok(autenticacaoService.solicitarRedefinicao(requisicao));
    }

    // Conclusão da Redefinição de Senha — Volta na Sessão
    @PostMapping("/senha/redefinir")
    public ResponseEntity<SessaoRespostaDTO> redefinirSenha(
            @Valid @RequestBody RedefinirSenhaRequestDTO requisicao) {
        return ResponseEntity.ok(autenticacaoService.redefinirSenha(requisicao));
    }
}
