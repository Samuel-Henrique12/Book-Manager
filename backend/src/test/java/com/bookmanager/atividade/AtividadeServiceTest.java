package com.bookmanager.atividade;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.bookmanager.atividade.dto.AtividadeDTO;
import com.bookmanager.atividade.dto.AtividadeDTO.TipoAtividade;
import com.bookmanager.avaliacao.Avaliacao;
import com.bookmanager.avaliacao.AvaliacaoRepository;
import com.bookmanager.comentario.Comentario;
import com.bookmanager.comentario.ComentarioRepository;
import com.bookmanager.livro.Livro;
import com.bookmanager.usuario.Usuario;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;

// Testes do Feed da Comunidade
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class AtividadeServiceTest {

    private static final Instant AGORA = Instant.parse("2026-07-29T12:00:00Z");

    @Mock
    private AvaliacaoRepository avaliacaoRepository;

    @Mock
    private ComentarioRepository comentarioRepository;

    @InjectMocks
    private AtividadeService atividadeService;

    private Usuario leitor(String nome) {
        Usuario usuario = new Usuario();
        usuario.setNome(nome);
        return usuario;
    }

    private Livro livro() {
        Livro livro = new Livro();
        livro.setId(7L);
        livro.setTitulo("Dom Casmurro");
        livro.setUrlCapa("https://capa");
        return livro;
    }

    private Avaliacao resenha(String nome, short nota, Instant quando, boolean spoiler) {
        Avaliacao avaliacao = new Avaliacao();
        avaliacao.setUsuario(leitor(nome));
        avaliacao.setLivro(livro());
        avaliacao.setNota(nota);
        avaliacao.setResenha("Texto da resenha");
        avaliacao.setSpoiler(spoiler);
        avaliacao.setCriadoEm(quando);
        return avaliacao;
    }

    private Comentario comentario(String nome, Instant quando) {
        Comentario comentario = new Comentario();
        comentario.setUsuario(leitor(nome));
        comentario.setLivro(livro());
        comentario.setTexto("Texto do comentário");
        comentario.setCriadoEm(quando);
        return comentario;
    }

    private Page<Comentario> pagina(List<Comentario> itens) {
        return new PageImpl<>(itens);
    }

    @Test
    @DisplayName("Intercala resenhas e comentários do mais recente para o mais antigo")
    void intercalarPorData() {
        when(avaliacaoRepository.listarUltimasResenhas(any()))
                .thenReturn(List.of(resenha("Ana", (short) 5, AGORA.minusSeconds(60), false)));
        when(comentarioRepository.findAll(any(org.springframework.data.domain.Pageable.class)))
                .thenReturn(pagina(List.of(comentario("Bruno", AGORA))));

        List<AtividadeDTO> feed = atividadeService.recentes(10);

        assertThat(feed).hasSize(2);
        assertThat(feed.get(0).tipo()).isEqualTo(TipoAtividade.COMMENT);
        assertThat(feed.get(0).nomeLeitor()).isEqualTo("Bruno");
        assertThat(feed.get(1).tipo()).isEqualTo(TipoAtividade.REVIEW);
    }

    @Test
    @DisplayName("Resenha leva nota e comentário não")
    void notaSomenteNaResenha() {
        when(avaliacaoRepository.listarUltimasResenhas(any()))
                .thenReturn(List.of(resenha("Ana", (short) 4, AGORA, false)));
        when(comentarioRepository.findAll(any(org.springframework.data.domain.Pageable.class)))
                .thenReturn(pagina(List.of(comentario("Bruno", AGORA.minusSeconds(30)))));

        List<AtividadeDTO> feed = atividadeService.recentes(10);

        assertThat(feed.get(0).nota()).isEqualTo((short) 4);
        assertThat(feed.get(1).nota()).isNull();
    }

    @Test
    @DisplayName("Respeita o limite pedido mesmo somando as duas origens")
    void respeitarLimite() {
        when(avaliacaoRepository.listarUltimasResenhas(any())).thenReturn(List.of(
                resenha("Ana", (short) 5, AGORA, false),
                resenha("Caio", (short) 3, AGORA.minusSeconds(10), false)));
        when(comentarioRepository.findAll(any(org.springframework.data.domain.Pageable.class)))
                .thenReturn(pagina(List.of(
                        comentario("Bruno", AGORA.minusSeconds(5)),
                        comentario("Dora", AGORA.minusSeconds(20)))));

        assertThat(atividadeService.recentes(3)).hasSize(3);
    }

    @Test
    @DisplayName("Preserva a marcação de spoiler")
    void preservarSpoiler() {
        when(avaliacaoRepository.listarUltimasResenhas(any()))
                .thenReturn(List.of(resenha("Ana", (short) 2, AGORA, true)));
        when(comentarioRepository.findAll(any(org.springframework.data.domain.Pageable.class)))
                .thenReturn(pagina(List.of()));

        assertThat(atividadeService.recentes(5).get(0).spoiler()).isTrue();
    }

    @Test
    @DisplayName("Sem publicações o feed volta vazio")
    void feedVazio() {
        when(avaliacaoRepository.listarUltimasResenhas(any())).thenReturn(List.of());
        when(comentarioRepository.findAll(any(org.springframework.data.domain.Pageable.class)))
                .thenReturn(pagina(List.of()));

        assertThat(atividadeService.recentes(8)).isEmpty();
    }
}
