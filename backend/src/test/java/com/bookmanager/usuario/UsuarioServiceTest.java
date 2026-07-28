package com.bookmanager.usuario;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.bookmanager.autenticacao.seguranca.PoliticaAdmin;
import com.bookmanager.autenticacao.verificacao.TokenVerificacaoRepository;
import com.bookmanager.comum.excecao.RegraDeNegocioException;
import com.bookmanager.usuario.dto.AlterarPerfilRequestDTO;
import com.bookmanager.usuario.dto.AlterarSenhaRequestDTO;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.crypto.password.PasswordEncoder;

// Testes das Regras de Conta e Administracao de Usuarios
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class UsuarioServiceTest {

    private static final String EMAIL = "leitor@bookmanager.local";
    private static final String SENHA_CODIFICADA = "$2a$10$hash";

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private TokenVerificacaoRepository tokenRepository;

    @Mock
    private UsuarioMapper usuarioMapper;

    @Mock
    private PasswordEncoder codificadorDeSenha;

    @Mock
    private PoliticaAdmin politicaAdmin;

    @InjectMocks
    private UsuarioService usuarioService;

    private Usuario usuario;

    @BeforeEach
    void preparar() {
        usuario = new Usuario();
        usuario.setId(1L);
        usuario.setNome("Leitor");
        usuario.setEmail(EMAIL);
        usuario.setSenha(SENHA_CODIFICADA);
        usuario.setPerfil(Perfil.USUARIO);
        usuario.setEmailConfirmado(true);

        when(usuarioRepository.findByEmailIgnoreCase(EMAIL)).thenReturn(Optional.of(usuario));
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(chamada -> chamada.getArgument(0));
    }

    @Test
    @DisplayName("Recusa a troca de senha quando a senha atual está incorreta")
    void recusarSenhaAtualIncorreta() {
        when(codificadorDeSenha.matches("errada", SENHA_CODIFICADA)).thenReturn(false);

        assertThatThrownBy(() -> usuarioService.alterarSenha(EMAIL,
                new AlterarSenhaRequestDTO("errada", "novaSenha")))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("senha atual");

        verify(usuarioRepository, never()).save(any(Usuario.class));
    }

    @Test
    @DisplayName("Recusa a nova senha quando ela é igual à anterior")
    void recusarNovaSenhaIgual() {
        when(codificadorDeSenha.matches(anyString(), anyString())).thenReturn(true);

        assertThatThrownBy(() -> usuarioService.alterarSenha(EMAIL,
                new AlterarSenhaRequestDTO("atual", "atual")))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("diferente da anterior");

        verify(usuarioRepository, never()).save(any(Usuario.class));
    }

    @Test
    @DisplayName("Grava a nova senha codificada quando a atual confere")
    void alterarSenhaComSucesso() {
        when(codificadorDeSenha.matches("atual", SENHA_CODIFICADA)).thenReturn(true);
        when(codificadorDeSenha.matches("nova", SENHA_CODIFICADA)).thenReturn(false);
        when(codificadorDeSenha.encode("nova")).thenReturn("$2a$10$novohash");

        usuarioService.alterarSenha(EMAIL, new AlterarSenhaRequestDTO("atual", "nova"));

        assertThat(usuario.getSenha()).isEqualTo("$2a$10$novohash");
        verify(usuarioRepository).save(usuario);
    }

    @Test
    @DisplayName("Invalida os tokens pendentes e faz soft delete ao excluir a própria conta")
    void excluirPropriaConta() {
        usuarioService.excluirConta(EMAIL);

        verify(tokenRepository).invalidarTodosDoUsuario(usuario);
        verify(usuarioRepository).delete(usuario);
    }

    @Test
    @DisplayName("Recusa a exclusão do último administrador")
    void recusarExclusaoDoUltimoAdmin() {
        usuario.setPerfil(Perfil.ADMIN);
        when(usuarioRepository.countByPerfil(Perfil.ADMIN)).thenReturn(1L);

        assertThatThrownBy(() -> usuarioService.excluirConta(EMAIL))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("último administrador");

        verify(usuarioRepository, never()).delete(any(Usuario.class));
    }

    @Test
    @DisplayName("Recusa rebaixar o último administrador")
    void recusarRebaixarUltimoAdmin() {
        usuario.setPerfil(Perfil.ADMIN);
        when(usuarioRepository.countByPerfil(Perfil.ADMIN)).thenReturn(1L);

        assertThatThrownBy(() -> usuarioService.alterarPerfil(1L,
                new AlterarPerfilRequestDTO(Perfil.USUARIO)))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("último administrador");

        assertThat(usuario.getPerfil()).isEqualTo(Perfil.ADMIN);
    }

    @Test
    @DisplayName("Promove um usuário comum a administrador")
    void promoverUsuarioParaAdmin() {
        usuarioService.alterarPerfil(1L, new AlterarPerfilRequestDTO(Perfil.ADMIN));

        assertThat(usuario.getPerfil()).isEqualTo(Perfil.ADMIN);
        verify(usuarioRepository).save(usuario);
    }

    @Test
    @DisplayName("Recusa a auto-exclusão pelo painel administrativo")
    void recusarAutoExclusaoPeloPainel() {
        assertThatThrownBy(() -> usuarioService.removerUsuario(1L, EMAIL))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("Minha conta");

        verify(usuarioRepository, never()).delete(any(Usuario.class));
    }

    @Test
    @DisplayName("Exclui outro usuário pelo painel administrativo")
    void excluirOutroUsuarioPeloPainel() {
        usuarioService.removerUsuario(1L, "admin@bookmanager.local");

        verify(tokenRepository).invalidarTodosDoUsuario(usuario);
        verify(usuarioRepository).delete(usuario);
    }
}
