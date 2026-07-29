package com.bookmanager.livro;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.bookmanager.avaliacao.AvaliacaoRepository;
import com.bookmanager.comum.paginacao.RespostaPaginadaDTO;
import com.bookmanager.estante.Estante;
import com.bookmanager.estante.EstanteService;
import com.bookmanager.estante.StatusLeitura;
import com.bookmanager.livro.dto.LivroResumoDTO;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

// Testes do Enriquecimento da Listagem (estante + nota da comunidade)
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class LivroServiceTest {

    private static final String EMAIL = "ana@bm.dev";
    private static final Pageable PAGINA = PageRequest.of(0, 10);

    @Mock
    private LivroRepository livroRepository;

    @Mock
    private LivroMapper livroMapper;

    @Mock
    private EstanteService estanteService;

    @Mock
    private AvaliacaoRepository avaliacaoRepository;

    @InjectMocks
    private LivroService livroService;

    private Livro livro;

    @BeforeEach
    void preparar() {
        livro = new Livro();
        livro.setId(1L);
        livro.setTitulo("Dom Casmurro");
        livro.setAutor("Machado de Assis");

        when(livroRepository.buscar(anyString(), anyString(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(livro)));
        when(livroMapper.paraResumo(livro)).thenAnswer(chamada -> new LivroResumoDTO(
                1L, "Dom Casmurro", "Machado de Assis", 1899, null, null,
                new BigDecimal("4.4"), 391, List.of(), null, null, null, null));
        when(estanteService.porLivros(anyString(), anyList())).thenReturn(Map.of());
        when(avaliacaoRepository.resumirPorLivros(anyList())).thenReturn(List.of());
    }

    private LivroResumoDTO primeiro() {
        RespostaPaginadaDTO<LivroResumoDTO> resposta =
                livroService.listar(null, null, EMAIL, PAGINA);
        return resposta.conteudo().get(0);
    }

    @Test
    @DisplayName("Traz a nota da comunidade junto com a do Google")
    void trazerNotaDaComunidade() {
        when(avaliacaoRepository.resumirPorLivros(anyList()))
                .thenReturn(List.<Object[]>of(new Object[] {1L, 3.5d, 2L}));

        LivroResumoDTO resumo = primeiro();

        assertThat(resumo.mediaComunidade()).isEqualByComparingTo(new BigDecimal("3.5"));
        assertThat(resumo.totalComunidade()).isEqualTo(2);
        // A Nota do Google Continua Disponivel
        assertThat(resumo.mediaAvaliacao()).isEqualByComparingTo(new BigDecimal("4.4"));
    }

    @Test
    @DisplayName("Arredonda a média da comunidade para uma casa")
    void arredondarMedia() {
        when(avaliacaoRepository.resumirPorLivros(anyList()))
                .thenReturn(List.<Object[]>of(new Object[] {1L, 4.6666d, 3L}));

        assertThat(primeiro().mediaComunidade()).isEqualByComparingTo(new BigDecimal("4.7"));
    }

    @Test
    @DisplayName("Livro sem avaliação nossa fica só com a nota do Google")
    void semAvaliacaoDaComunidade() {
        LivroResumoDTO resumo = primeiro();

        assertThat(resumo.mediaComunidade()).isNull();
        assertThat(resumo.totalComunidade()).isNull();
        assertThat(resumo.mediaAvaliacao()).isEqualByComparingTo(new BigDecimal("4.4"));
    }

    @Test
    @DisplayName("Estante e nota da comunidade convivem no mesmo resumo")
    void estanteMaisNota() {
        Estante estante = new Estante();
        estante.setStatus(StatusLeitura.LENDO);
        estante.setFavorito(true);
        when(estanteService.porLivros(anyString(), anyList())).thenReturn(Map.of(1L, estante));
        when(avaliacaoRepository.resumirPorLivros(anyList()))
                .thenReturn(List.<Object[]>of(new Object[] {1L, 5.0d, 1L}));

        LivroResumoDTO resumo = primeiro();

        assertThat(resumo.statusEstante()).isEqualTo(StatusLeitura.LENDO);
        assertThat(resumo.favorito()).isTrue();
        assertThat(resumo.mediaComunidade()).isEqualByComparingTo(new BigDecimal("5.0"));
    }

    @Test
    @DisplayName("Página vazia não consulta notas à toa")
    void paginaVaziaNaoConsulta() {
        when(livroRepository.buscar(anyString(), anyString(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        livroService.listar(null, null, EMAIL, PAGINA);

        verify(avaliacaoRepository, never()).resumirPorLivros(anyList());
    }
}
