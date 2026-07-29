package com.bookmanager.comentario;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.bookmanager.comentario.dto.ComentarioRequestDTO;
import com.bookmanager.comentario.dto.ComentarioRespostaDTO;
import com.bookmanager.livro.Livro;
import com.bookmanager.livro.LivroRepository;
import com.bookmanager.usuario.Perfil;
import com.bookmanager.usuario.Usuario;
import com.bookmanager.usuario.UsuarioService;
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
import org.springframework.security.access.AccessDeniedException;

// Testes das Regras de Comentario e Moderacao
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ComentarioServiceTest {

    private static final Long LIVRO_ID = 7L;

    @Mock
    private ComentarioRepository comentarioRepository;

    @Mock
    private LivroRepository livroRepository;

    @Mock
    private UsuarioService usuarioService;

    @InjectMocks
    private ComentarioService comentarioService;

    private Usuario ana;
    private Usuario bruno;
    private Usuario moderador;
    private Comentario comentarioDaAna;

    private Usuario usuario(Long id, String nome, String email, Perfil perfil) {
        Usuario usuario = new Usuario();
        usuario.setId(id);
        usuario.setNome(nome);
        usuario.setEmail(email);
        usuario.setPerfil(perfil);
        return usuario;
    }

    @BeforeEach
    void preparar() {
        ana = usuario(1L, "Ana", "ana@bm.dev", Perfil.USUARIO);
        bruno = usuario(2L, "Bruno", "bruno@bm.dev", Perfil.USUARIO);
        moderador = usuario(3L, "Mod", "mod@bm.dev", Perfil.ADMIN);

        Livro livro = new Livro();
        livro.setId(LIVRO_ID);

        comentarioDaAna = new Comentario();
        comentarioDaAna.setId(50L);
        comentarioDaAna.setUsuario(ana);
        comentarioDaAna.setLivro(livro);
        comentarioDaAna.setTexto("O segundo capítulo é difícil");

        when(usuarioService.buscarPorEmail("ana@bm.dev")).thenReturn(ana);
        when(usuarioService.buscarPorEmail("bruno@bm.dev")).thenReturn(bruno);
        when(usuarioService.buscarPorEmail("mod@bm.dev")).thenReturn(moderador);
        when(livroRepository.findById(LIVRO_ID)).thenReturn(Optional.of(livro));
        when(comentarioRepository.findById(50L)).thenReturn(Optional.of(comentarioDaAna));
        when(comentarioRepository.save(any(Comentario.class)))
                .thenAnswer(chamada -> chamada.getArgument(0));
    }

    @Test
    @DisplayName("Publica comentário com o texto aparado e sem spoiler por padrão")
    void publicarComentario() {
        ComentarioRespostaDTO dto = comentarioService.publicar(LIVRO_ID, "ana@bm.dev",
                new ComentarioRequestDTO("  Achei ótimo  "));

        assertThat(dto.texto()).isEqualTo("Achei ótimo");
        assertThat(dto.spoiler()).isFalse();
        assertThat(dto.nomeLeitor()).isEqualTo("Ana");
        assertThat(dto.meu()).isTrue();
    }

    @Test
    @DisplayName("O autor remove o próprio comentário")
    void autorRemoveOProprio() {
        comentarioService.remover(50L, "ana@bm.dev");

        verify(comentarioRepository).delete(comentarioDaAna);
    }

    @Test
    @DisplayName("Outro leitor não remove comentário alheio")
    void leitorNaoRemoveComentarioAlheio() {
        assertThatThrownBy(() -> comentarioService.remover(50L, "bruno@bm.dev"))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("próprios comentários");

        verify(comentarioRepository, never()).delete(any(Comentario.class));
    }

    @Test
    @DisplayName("Administrador remove comentário de qualquer leitor")
    void adminRemoveQualquerComentario() {
        comentarioService.remover(50L, "mod@bm.dev");

        verify(comentarioRepository).delete(comentarioDaAna);
    }

    @Test
    @DisplayName("Administrador marca e desmarca spoiler")
    void adminMarcaSpoiler() {
        ComentarioRespostaDTO marcado =
                comentarioService.marcarSpoiler(50L, true, "mod@bm.dev");
        assertThat(marcado.spoiler()).isTrue();
        assertThat(comentarioDaAna.isSpoiler()).isTrue();

        ComentarioRespostaDTO desmarcado =
                comentarioService.marcarSpoiler(50L, false, "mod@bm.dev");
        assertThat(desmarcado.spoiler()).isFalse();
    }

    @Test
    @DisplayName("Comentário inexistente devolve não encontrado")
    void comentarioInexistente() {
        when(comentarioRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> comentarioService.remover(999L, "mod@bm.dev"))
                .hasMessageContaining("Comentário não encontrado");
    }
}
