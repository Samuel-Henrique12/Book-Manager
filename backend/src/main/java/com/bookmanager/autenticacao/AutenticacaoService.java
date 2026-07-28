package com.bookmanager.autenticacao;

import com.bookmanager.autenticacao.dto.EmailRequestDTO;
import com.bookmanager.autenticacao.dto.LoginRequestDTO;
import com.bookmanager.autenticacao.dto.MensagemRespostaDTO;
import com.bookmanager.autenticacao.dto.RedefinirSenhaRequestDTO;
import com.bookmanager.autenticacao.dto.RegistroRequestDTO;
import com.bookmanager.autenticacao.dto.SessaoRespostaDTO;
import com.bookmanager.autenticacao.dto.TokenRequestDTO;
import com.bookmanager.autenticacao.dto.TokenRespostaDTO;
import com.bookmanager.autenticacao.seguranca.ServicoTokenJwt;
import com.bookmanager.autenticacao.verificacao.ServicoVerificacao;
import com.bookmanager.autenticacao.verificacao.TipoToken;
import com.bookmanager.comum.email.ServicoEmail;
import com.bookmanager.comum.excecao.ConflitoException;
import com.bookmanager.comum.excecao.ContaNaoConfirmadaException;
import com.bookmanager.comum.excecao.CredenciaisInvalidasException;
import com.bookmanager.comum.excecao.RegraDeNegocioException;
import com.bookmanager.usuario.Perfil;
import com.bookmanager.usuario.Usuario;
import com.bookmanager.usuario.UsuarioRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// Service de Autenticacao
@Slf4j
@Service
@RequiredArgsConstructor
public class AutenticacaoService {

    private static final String TIPO_TOKEN = "Bearer";

    // Resposta Neutra Não Revela Se o Email Existe
    private static final String AVISO_NEUTRO =
            "Se este e-mail estiver cadastrado, você receberá uma mensagem em instantes.";

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder codificadorDeSenha;
    private final ServicoTokenJwt servicoTokenJwt;
    private final AuthenticationManager gerenciadorDeAutenticacao;
    private final ServicoVerificacao servicoVerificacao;
    private final ServicoEmail servicoEmail;

    // Cria a Conta Pendente e Dispara a Confirmacao
    @Transactional
    public MensagemRespostaDTO registrar(RegistroRequestDTO requisicao) {
        String email = normalizar(requisicao.email());
        if (usuarioRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflitoException("E-mail já cadastrado");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(requisicao.nome().trim());
        usuario.setEmail(email);
        usuario.setSenha(codificadorDeSenha.encode(requisicao.senha()));
        usuario.setPerfil(Perfil.USUARIO);
        usuario.setEmailConfirmado(false);
        usuarioRepository.save(usuario);

        enviarConfirmacao(usuario);
        return new MensagemRespostaDTO(
                "Conta criada. Confirme seu e-mail para poder entrar.", usuario.getEmail());
    }

    // Autentica e Exige E-mail Confirmado
    @Transactional(readOnly = true)
    public TokenRespostaDTO login(LoginRequestDTO requisicao) {
        String email = normalizar(requisicao.email());
        try {
            gerenciadorDeAutenticacao.authenticate(
                    new UsernamePasswordAuthenticationToken(email, requisicao.senha()));
        } catch (AuthenticationException ex) {
            throw new CredenciaisInvalidasException("E-mail ou senha inválidos");
        }

        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new CredenciaisInvalidasException("E-mail ou senha inválidos"));

        if (!usuario.isEmailConfirmado()) {
            throw new ContaNaoConfirmadaException(
                    "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.");
        }

        String token = servicoTokenJwt.gerarToken(usuario.getEmail());
        return new TokenRespostaDTO(usuario.getNome(), token, TIPO_TOKEN,
                servicoTokenJwt.obterExpiracaoEmSegundos());
    }

    // Ativa a Conta pelo Link Recebido e Ja Abre Sessao
    @Transactional
    public SessaoRespostaDTO confirmarEmail(TokenRequestDTO requisicao) {
        Usuario usuario = servicoVerificacao.consumir(requisicao.token(), TipoToken.CONFIRMACAO_EMAIL);

        if (!usuario.isEmailConfirmado()) {
            usuario.setEmailConfirmado(true);
            usuarioRepository.save(usuario);
        }

        return montarSessao("Conta confirmada. Bem-vindo!", usuario);
    }

    // Reenvia a Confirmacao sem Revelar se a Conta Existe
    @Transactional
    public MensagemRespostaDTO reenviarConfirmacao(EmailRequestDTO requisicao) {
        Optional<Usuario> encontrado = usuarioRepository.findByEmailIgnoreCase(normalizar(requisicao.email()));

        encontrado
                .filter(usuario -> !usuario.isEmailConfirmado())
                .ifPresent(this::enviarConfirmacao);

        return new MensagemRespostaDTO(AVISO_NEUTRO, null);
    }

    // Inicia a Redefinicao de Senha
    @Transactional
    public MensagemRespostaDTO solicitarRedefinicao(EmailRequestDTO requisicao) {
        usuarioRepository.findByEmailIgnoreCase(normalizar(requisicao.email())).ifPresent(usuario -> {
            String token = servicoVerificacao.emitir(usuario, TipoToken.REDEFINICAO_SENHA);
            servicoEmail.enviarRedefinicaoDeSenha(usuario.getEmail(), usuario.getNome(), token);
        });

        return new MensagemRespostaDTO(AVISO_NEUTRO, null);
    }

    // Conclui a Redefinição de Senha e Abre Sessão
    @Transactional
    public SessaoRespostaDTO redefinirSenha(RedefinirSenhaRequestDTO requisicao) {
        Usuario usuario = servicoVerificacao.consumir(requisicao.token(), TipoToken.REDEFINICAO_SENHA);

        if (codificadorDeSenha.matches(requisicao.senha(), usuario.getSenha())) {
            throw new RegraDeNegocioException("A nova senha deve ser diferente da anterior");
        }

        usuario.setSenha(codificadorDeSenha.encode(requisicao.senha()));
        usuario.setEmailConfirmado(true);
        usuarioRepository.save(usuario);

        return montarSessao("Senha alterada com sucesso.", usuario);
    }

    // Emite o JWT para Quem Ja Provou Controle do E-mail
    private SessaoRespostaDTO montarSessao(String mensagem, Usuario usuario) {
        String token = servicoTokenJwt.gerarToken(usuario.getEmail());
        return new SessaoRespostaDTO(mensagem, usuario.getNome(), usuario.getEmail(),
                token, TIPO_TOKEN, servicoTokenJwt.obterExpiracaoEmSegundos());
    }

    private void enviarConfirmacao(Usuario usuario) {
        String token = servicoVerificacao.emitir(usuario, TipoToken.CONFIRMACAO_EMAIL);
        servicoEmail.enviarConfirmacaoDeConta(usuario.getEmail(), usuario.getNome(), token);
    }

    private String normalizar(String email) {
        return email.toLowerCase().trim();
    }
}
