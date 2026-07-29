package com.bookmanager.estante;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.bookmanager.comum.excecao.RegraDeNegocioException;
import com.bookmanager.estante.dto.EstanteRequestDTO;
import com.bookmanager.estante.dto.EstanteRespostaDTO;
import com.bookmanager.estante.dto.ResumoEstanteDTO;
import com.bookmanager.livro.Livro;
import com.bookmanager.livro.LivroMapper;
import com.bookmanager.livro.LivroRepository;
import com.bookmanager.usuario.Usuario;
import com.bookmanager.usuario.UsuarioService;
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

// Testes das Regras da Estante
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class EstanteServiceTest {

    private static final String EMAIL = "ana@bm.dev";
    private static final Long LIVRO_ID = 9L;

    @Mock
    private EstanteRepository estanteRepository;

    @Mock
    private LivroRepository livroRepository;

    @Mock
    private LivroMapper livroMapper;

    @Mock
    private UsuarioService usuarioService;

    @InjectMocks
    private EstanteService estanteService;

    private Usuario ana;
    private Livro livro;

    @BeforeEach
    void preparar() {
        ana = new Usuario();
        ana.setId(1L);
        ana.setEmail(EMAIL);

        livro = new Livro();
        livro.setId(LIVRO_ID);
        livro.setTitulo("Dom Casmurro");
        livro.setTotalPaginas(200);

        when(usuarioService.buscarPorEmail(EMAIL)).thenReturn(ana);
        when(livroRepository.findById(LIVRO_ID)).thenReturn(Optional.of(livro));
        when(estanteRepository.findByUsuarioIdAndLivroId(1L, LIVRO_ID)).thenReturn(Optional.empty());
        when(estanteRepository.save(any(Estante.class)))
                .thenAnswer(chamada -> chamada.getArgument(0));
    }

    @Test
    @DisplayName("Calcula o percentual de progresso a partir da página atual")
    void calcularProgresso() {
        EstanteRespostaDTO dto = estanteService.salvar(LIVRO_ID, EMAIL,
                new EstanteRequestDTO(StatusLeitura.LENDO, false, 50, null));

        assertThat(dto.progresso()).isEqualTo(25);
        assertThat(dto.totalPaginas()).isEqualTo(200);
    }

    @Test
    @DisplayName("Livro marcado como lido fica com 100% mesmo sem página informada")
    void lidoFica100() {
        EstanteRespostaDTO dto = estanteService.salvar(LIVRO_ID, EMAIL,
                new EstanteRequestDTO(StatusLeitura.LIDO, false, null, null));

        assertThat(dto.progresso()).isEqualTo(100);
        assertThat(dto.paginaAtual()).isNull();
    }

    @Test
    @DisplayName("Recusa página maior que o total do livro")
    void recusarPaginaAlemDoTotal() {
        assertThatThrownBy(() -> estanteService.salvar(LIVRO_ID, EMAIL,
                new EstanteRequestDTO(StatusLeitura.LENDO, false, 500, null)))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("200 páginas");

        verify(estanteRepository, never()).save(any(Estante.class));
    }

    @Test
    @DisplayName("Página atual só vale em leitura — some ao trocar de status")
    void paginaSoValeEmLeitura() {
        EstanteRespostaDTO dto = estanteService.salvar(LIVRO_ID, EMAIL,
                new EstanteRequestDTO(StatusLeitura.QUERO_LER, false, 80, null));

        assertThat(dto.paginaAtual()).isNull();
        assertThat(dto.progresso()).isNull();
    }

    @Test
    @DisplayName("Livro sem total do Google aceita o total informado pelo leitor")
    void totalInformadoManualmente() {
        livro.setTotalPaginas(null);

        EstanteRespostaDTO dto = estanteService.salvar(LIVRO_ID, EMAIL,
                new EstanteRequestDTO(StatusLeitura.LENDO, false, 30, 300));

        assertThat(dto.totalPaginas()).isEqualTo(300);
        assertThat(dto.progresso()).isEqualTo(10);
    }

    @Test
    @DisplayName("O total do Google tem prioridade sobre o informado à mão")
    void totalDoGooglePrevalece() {
        EstanteRespostaDTO dto = estanteService.salvar(LIVRO_ID, EMAIL,
                new EstanteRequestDTO(StatusLeitura.LENDO, false, 10, 999));

        assertThat(dto.totalPaginas()).isEqualTo(200);
    }

    @Test
    @DisplayName("Atualiza a vaga existente em vez de criar outra")
    void atualizarVagaExistente() {
        Estante existente = new Estante();
        existente.setId(5L);
        existente.setUsuario(ana);
        existente.setLivro(livro);
        existente.setStatus(StatusLeitura.QUERO_LER);
        when(estanteRepository.findByUsuarioIdAndLivroId(1L, LIVRO_ID))
                .thenReturn(Optional.of(existente));

        estanteService.salvar(LIVRO_ID, EMAIL,
                new EstanteRequestDTO(StatusLeitura.LIDO, true, null, null));

        assertThat(existente.getStatus()).isEqualTo(StatusLeitura.LIDO);
        assertThat(existente.isFavorito()).isTrue();
        verify(estanteRepository).save(existente);
    }

    @Test
    @DisplayName("Monta o resumo com contadores por status e o paginômetro")
    void montarResumo() {
        when(estanteRepository.contarPorStatus(1L)).thenReturn(List.of(
                new Object[] {StatusLeitura.LIDO, 4L},
                new Object[] {StatusLeitura.LENDO, 2L},
                new Object[] {StatusLeitura.QUERO_LER, 7L}));
        when(estanteRepository.countByUsuarioIdAndFavoritoTrue(1L)).thenReturn(3L);
        when(estanteRepository.somarPaginasLidas(1L)).thenReturn(1480L);

        ResumoEstanteDTO resumo = estanteService.resumo(EMAIL);

        assertThat(resumo.lidos()).isEqualTo(4);
        assertThat(resumo.lendo()).isEqualTo(2);
        assertThat(resumo.queroLer()).isEqualTo(7);
        assertThat(resumo.abandonados()).isZero();
        assertThat(resumo.favoritos()).isEqualTo(3);
        assertThat(resumo.total()).isEqualTo(13);
        assertThat(resumo.paginasLidas()).isEqualTo(1480);
    }

    @Test
    @DisplayName("Consulta em lote devolve mapa vazio quando não há livros")
    void loteVazio() {
        assertThat(estanteService.porLivros(EMAIL, List.of())).isEmpty();
        verify(estanteRepository, never()).findByUsuarioIdAndLivroIdIn(any(), any());
    }
}
