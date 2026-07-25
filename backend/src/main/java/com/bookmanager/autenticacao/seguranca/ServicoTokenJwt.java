package com.bookmanager.autenticacao.seguranca;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Service;

// Geração e Validação de Tokens JWT
@Service
public class ServicoTokenJwt {

    // Chave Secreta, Expiração e Emissor do Token
    private final SecretKey chave;
    private final Duration expiracao;
    private final String emissor;

    // Constructor de Inicialização, Expiração e Emissão do Token
    public ServicoTokenJwt(PropriedadesJwt propriedades) {
        this.chave = Keys.hmacShaKeyFor(propriedades.secret().getBytes(StandardCharsets.UTF_8));
        this.expiracao = propriedades.expiracao();
        this.emissor = propriedades.emissor();
    }

    // Gera Token JWT com Email do Usuario
    public String gerarToken(String email) {
        Instant agora = Instant.now();
        return Jwts.builder()
                .subject(email)
                .issuer(emissor)
                .issuedAt(Date.from(agora))
                .expiration(Date.from(agora.plus(expiracao)))
                .signWith(chave)
                .compact();
    }

    public String extrairEmail(String token) {
        return analisar(token).getPayload().getSubject();
    }

    // Valida Token JWT
    public boolean valido(String token) {
        try {
            analisar(token);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }

    public long obterExpiracaoEmSegundos() {
        return expiracao.toSeconds();
    }

    // Analisa Token JWT e Retorna Claims
    private Jws<Claims> analisar(String token) {
        return Jwts.parser()
                .verifyWith(chave)
                .requireIssuer(emissor)
                .build()
                .parseSignedClaims(token);
    }
}
