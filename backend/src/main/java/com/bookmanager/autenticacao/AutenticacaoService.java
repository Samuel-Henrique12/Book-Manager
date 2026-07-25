package com.bookmanager.autenticacao;

import com.bookmanager.autenticacao.dto.LoginRequestDTO;
import com.bookmanager.autenticacao.dto.RegistroRequestDTO;
import com.bookmanager.autenticacao.dto.TokenRespostaDTO;
import com.bookmanager.autenticacao.seguranca.ServicoTokenJwt;
import com.bookmanager.comum.excecao.ConflitoException;
import com.bookmanager.comum.excecao.CredenciaisInvalidasException;
import com.bookmanager.usuario.Perfil;
import com.bookmanager.usuario.Usuario;
import com.bookmanager.usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// Service de Autenticacao
@Service
@RequiredArgsConstructor
public class AutenticacaoService {
    // Tipos de Token JWT
    private static final String TIPO_TOKEN = "Bearer";
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder codificadorDeSenha;
    private final ServicoTokenJwt servicoTokenJwt;
    private final AuthenticationManager gerenciadorDeAutenticacao;

    // Realiza Registro de Novo Usuario e Gera Token JWT
    @Transactional
    public TokenRespostaDTO registrar(RegistroRequestDTO requisicao) {
        String email = requisicao.email().toLowerCase().trim();
        if (usuarioRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflitoException("E-mail já cadastrado");
        }
        Usuario usuario = new Usuario();
        usuario.setNome(requisicao.nome().trim());
        usuario.setEmail(email);
        usuario.setSenha(codificadorDeSenha.encode(requisicao.senha()));
        usuario.setPerfil(Perfil.USUARIO);
        usuarioRepository.save(usuario);
        return gerarResposta(usuario.getEmail());
    }

    // Realiza Login e Gera Token JWT
    @Transactional(readOnly = true)
    public TokenRespostaDTO login(LoginRequestDTO requisicao) {
        String email = requisicao.email().toLowerCase().trim();
        try {
            gerenciadorDeAutenticacao.authenticate(
                    new UsernamePasswordAuthenticationToken(email, requisicao.senha()));
        } catch (AuthenticationException ex) {
            throw new CredenciaisInvalidasException("E-mail ou senha inválidos");
        }
        return gerarResposta(email);
    }

    // Gera Resposta com Token JWT
    private TokenRespostaDTO gerarResposta(String email) {
        String token = servicoTokenJwt.gerarToken(email);
        return new TokenRespostaDTO(token, TIPO_TOKEN, servicoTokenJwt.obterExpiracaoEmSegundos());
    }
}
