package com.bookmanager.autenticacao.verificacao;

import com.bookmanager.comum.excecao.TokenInvalidoException;
import com.bookmanager.usuario.Usuario;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// Emissao e Validacao de Tokens de Verificacao
@Service
@RequiredArgsConstructor
public class ServicoVerificacao {

    private static final int BYTES_DO_TOKEN = 32;

    private final TokenVerificacaoRepository tokenRepository;
    private final PropriedadesVerificacao propriedades;
    private final SecureRandom aleatorio = new SecureRandom();

    // Gera o Token em Claro e Persiste Apenas o Hash
    @Transactional
    public String emitir(Usuario usuario, TipoToken tipo) {
        tokenRepository.invalidarPendentes(usuario, tipo);

        byte[] bruto = new byte[BYTES_DO_TOKEN];
        aleatorio.nextBytes(bruto);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bruto);

        TokenVerificacao registro = new TokenVerificacao();
        registro.setUsuario(usuario);
        registro.setTokenHash(gerarHash(token));
        registro.setTipo(tipo);
        registro.setExpiraEm(Instant.now().plus(propriedades.validadePara(tipo)));
        tokenRepository.save(registro);

        return token;
    }

    // Valida e Consome o Token de Uso Unico
    @Transactional
    public Usuario consumir(String token, TipoToken tipo) {
        if (token == null || token.isBlank()) {
            throw new TokenInvalidoException("Link inválido ou incompleto");
        }

        TokenVerificacao registro = tokenRepository
                .findByTokenHashAndTipo(gerarHash(token), tipo)
                .orElseThrow(() -> new TokenInvalidoException("Link inválido ou já utilizado"));

        if (registro.utilizado()) {
            throw new TokenInvalidoException("Este link já foi utilizado");
        }
        if (registro.expirado()) {
            throw new TokenInvalidoException("Este link expirou. Solicite um novo");
        }

        registro.setUsadoEm(Instant.now());
        tokenRepository.save(registro);
        return registro.getUsuario();
    }

    private String gerarHash(String token) {
        try {
            MessageDigest resumo = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(resumo.digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("Algoritmo SHA-256 indisponível", ex);
        }
    }
}
