package com.bookmanager.avaliacao;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.bookmanager.avaliacao.dto.AvaliacaoRequestDTO;
import com.bookmanager.avaliacao.dto.AvaliacaoRespostaDTO;
import com.bookmanager.avaliacao.dto.ResumoAvaliacoesDTO;
import com.bookmanager.livro.Livro;
import com.bookmanager.livro.LivroRepository;
import com.bookmanager.usuario.Usuario;
import com.bookmanager.usuario.UsuarioService;
import java.math.BigDecimal;
import java.util.List;
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

// Testes das Regras de Avaliacao
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class AvaliacaoServiceTest {

    private static final String EMAIL = "ana@bm.dev";
    private static final Long LIVRO_ID = 7L;

    @Mock
    private AvaliacaoRepository avaliacaoRepository;

    @Mock
    private LivroRepository livroRepository;

    @Mock
    private UsuarioService usuarioService;

    @InjectMocks
    private AvaliacaoService avaliacaoService;

    private Usuario ana;
    private Livro livro;

    @BeforeEach
    void preparar() {
        ana = new Usuario();
        ana.setId(1L);
        ana.setNome("Ana Leitora");
        ana.setEmail(EMAIL);

        livro = new Livro();
        livro.setId(LIVRO_ID);
        livro.setTitulo("Dom Casmurro");

        when(usuarioService.buscarPorEmail(EMAIL)).thenReturn(ana);
        when(livroRepository.findById(LIVRO_ID)).thenReturn(Optional.of(livro));
        when(avaliacaoRepository.save(any(Avaliacao.class)))
                .thenAnswer(chamada -> chamada.getArgument(0));
    }

    private Avaliacao avaliacaoDe(Usuario usuario, short nota, String resenha) {
        Avaliacao avaliacao = new Avaliacao();
        avaliacao.setId(10L);
        avaliacao.setUsuario(usuario);
        avaliacao.setLivro(livro);
        avaliacao.setNota(nota);
        avaliacao.setResenha(resenha);
        return avaliacao;
    }

    @Test
    @DisplayName("Cria a avaliação quando o leitor ainda não avaliou o livro")
    void criarPrimeiraAvaliacao() {
        when(avaliacaoRepository.findByUsuarioIdAndLivroId(1L, LIVRO_ID)).thenReturn(Optional.empty());

        AvaliacaoRespostaDTO salva = avaliacaoService.salvar(LIVRO_ID, EMAIL,
                new AvaliacaoRequestDTO((short) 5, "Excelente", false));

        assertThat(salva.nota()).isEqualTo((short) 5);
        assertThat(salva.nomeLeitor()).isEqualTo("Ana Leitora");
        assertThat(salva.minha()).isTrue();
        verify(avaliacaoRepository).save(any(Avaliacao.class));
    }

    @Test
    @DisplayName("Substitui a nota em vez de criar uma segunda avaliação do mesmo leitor")
    void substituirAvaliacaoExistente() {
        Avaliacao existente = avaliacaoDe(ana, (short) 5, "Excelente");
        when(avaliacaoRepository.findByUsuarioIdAndLivroId(1L, LIVRO_ID))
                .thenReturn(Optional.of(existente));

        avaliacaoService.salvar(LIVRO_ID, EMAIL, new AvaliacaoRequestDTO((short) 2, "Mudei de ideia", false));

        assertThat(existente.getNota()).isEqualTo((short) 2);
        assertThat(existente.getResenha()).isEqualTo("Mudei de ideia");
        verify(avaliacaoRepository).save(existente);
    }

    @Test
    @DisplayName("Resenha em branco é gravada como nula, não como texto vazio")
    void resenhaEmBrancoViraNula() {
        when(avaliacaoRepository.findByUsuarioIdAndLivroId(1L, LIVRO_ID)).thenReturn(Optional.empty());

        AvaliacaoRespostaDTO salva = avaliacaoService.salvar(LIVRO_ID, EMAIL,
                new AvaliacaoRequestDTO((short) 4, "   ", false));

        assertThat(salva.resenha()).isNull();
    }

    @Test
    @DisplayName("Calcula média e distribuição a partir das notas")
    void calcularResumo() {
        when(avaliacaoRepository.contarPorNota(LIVRO_ID)).thenReturn(List.of(
                new Object[] {(short) 5, 6L},
                new Object[] {(short) 4, 3L},
                new Object[] {(short) 1, 1L}));

        ResumoAvaliacoesDTO resumo = avaliacaoService.resumo(LIVRO_ID);

        assertThat(resumo.total()).isEqualTo(10);
        assertThat(resumo.media()).isEqualByComparingTo(new BigDecimal("4.3"));
        assertThat(resumo.distribuicao()).hasSize(5);
        // Da Maior Nota para a Menor
        assertThat(resumo.distribuicao().get(0).nota()).isEqualTo(5);
        assertThat(resumo.distribuicao().get(0).percentual()).isEqualTo(60);
        assertThat(resumo.distribuicao().get(4).nota()).isEqualTo(1);
        assertThat(resumo.distribuicao().get(4).quantidade()).isEqualTo(1);
    }

    @Test
    @DisplayName("Livro sem avaliação nenhuma devolve resumo zerado, sem dividir por zero")
    void resumoSemAvaliacoes() {
        when(avaliacaoRepository.contarPorNota(LIVRO_ID)).thenReturn(List.of());

        ResumoAvaliacoesDTO resumo = avaliacaoService.resumo(LIVRO_ID);

        assertThat(resumo.total()).isZero();
        assertThat(resumo.media()).isNull();
        assertThat(resumo.distribuicao()).isEmpty();
    }

    @Test
    @DisplayName("Marca como 'minha' apenas a avaliação do próprio leitor")
    void distinguirAvaliacaoPropria() {
        Usuario bruno = new Usuario();
        bruno.setId(2L);
        bruno.setNome("Bruno");
        when(avaliacaoRepository.findByUsuarioIdAndLivroId(1L, LIVRO_ID))
                .thenReturn(Optional.of(avaliacaoDe(bruno, (short) 3, "Texto do Bruno")));

        AvaliacaoRespostaDTO dto = avaliacaoService.minhaAvaliacao(LIVRO_ID, EMAIL).orElseThrow();

        assertThat(dto.minha()).isFalse();
        assertThat(dto.nomeLeitor()).isEqualTo("Bruno");
    }

    @Test
    @DisplayName("Não salva avaliação para livro inexistente")
    void livroInexistente() {
        when(livroRepository.findById(LIVRO_ID)).thenReturn(Optional.empty());
        when(avaliacaoRepository.findByUsuarioIdAndLivroId(1L, LIVRO_ID)).thenReturn(Optional.empty());

        try {
            avaliacaoService.salvar(LIVRO_ID, EMAIL, new AvaliacaoRequestDTO((short) 5, null, false));
        } catch (RuntimeException esperado) {
            assertThat(esperado.getMessage()).contains("Livro não encontrado");
        }

        verify(avaliacaoRepository, never()).save(any(Avaliacao.class));
    }
}
