package com.bookmanager.integracao;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.bookmanager.comum.excecao.ConflitoException;
import com.bookmanager.comum.excecao.IntegracaoIndisponivelException;
import com.bookmanager.integracao.dto.ProgressoImportacaoDTO;
import com.bookmanager.integracao.dto.VolumeGoogleDTO;
import java.util.Collections;
import java.util.List;
import java.util.stream.IntStream;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

// Testes da Orquestracao da Importacao (sem Rede)
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ServicoImportacaoLivrosTest {

    @Mock
    private IntegracaoLivrosService integracaoLivrosService;

    @Mock
    private ImportadorLivros importadorLivros;

    private ProgressoImportacao progresso;
    private ServicoImportacaoLivros servico;

    private VolumeGoogleDTO volume(String id) {
        return new VolumeGoogleDTO(id, null);
    }

    private List<VolumeGoogleDTO> paginaCheia() {
        return IntStream.range(0, 40).mapToObj(i -> volume("vol-" + i)).toList();
    }

    private void montar(List<String> temas, int maxPorTema) {
        progresso = new ProgressoImportacao();
        PropriedadesGoogleBooks propriedades =
                new PropriedadesGoogleBooks(null, null, temas, maxPorTema, "pt");
        servico = new ServicoImportacaoLivros(
                integracaoLivrosService, importadorLivros, progresso, propriedades);
    }

    @BeforeEach
    void preparar() {
        montar(List.of("ficcao"), 40);
    }

    @Test
    @DisplayName("Conta importados e ignorados conforme o retorno do importador")
    void contarImportadosEIgnorados() {
        when(integracaoLivrosService.buscar(eq("ficcao"), anyInt(), anyInt()))
                .thenReturn(List.of(volume("a"), volume("b"), volume("c")));
        when(importadorLivros.importar(any())).thenReturn(true, false, true);

        servico.agendar();
        servico.executar();

        ProgressoImportacaoDTO resultado = servico.progresso();
        assertThat(resultado.importados()).isEqualTo(2);
        assertThat(resultado.ignorados()).isEqualTo(1);
        assertThat(resultado.emAndamento()).isFalse();
        assertThat(resultado.mensagem()).isEqualTo("Importação concluída");
    }

    @Test
    @DisplayName("Um volume com defeito vira falha sem interromper o lote")
    void volumeComDefeitoNaoDerrubaOLote() {
        when(integracaoLivrosService.buscar(eq("ficcao"), anyInt(), anyInt()))
                .thenReturn(List.of(volume("a"), volume("b")));
        when(importadorLivros.importar(any()))
                .thenThrow(new IllegalStateException("coluna estourada"))
                .thenReturn(true);

        servico.agendar();
        servico.executar();

        assertThat(servico.progresso().falhas()).isEqualTo(1);
        assertThat(servico.progresso().importados()).isEqualTo(1);
        assertThat(servico.progresso().mensagem()).isEqualTo("Importação concluída");
    }

    @Test
    @DisplayName("Para de paginar quando a API devolve página vazia")
    void pararEmPaginaVazia() {
        montar(List.of("ficcao"), 400);
        when(integracaoLivrosService.buscar(eq("ficcao"), eq(0), anyInt())).thenReturn(paginaCheia());
        when(integracaoLivrosService.buscar(eq("ficcao"), eq(40), anyInt())).thenReturn(List.of());

        servico.agendar();
        servico.executar();

        verify(integracaoLivrosService, times(2)).buscar(eq("ficcao"), anyInt(), anyInt());
    }

    @Test
    @DisplayName("Respeita o limite de livros por tema")
    void respeitarLimitePorTema() {
        montar(List.of("ficcao"), 80);
        when(integracaoLivrosService.buscar(eq("ficcao"), anyInt(), anyInt())).thenReturn(paginaCheia());

        servico.agendar();
        servico.executar();

        verify(integracaoLivrosService, times(2)).buscar(eq("ficcao"), anyInt(), anyInt());
    }

    @Test
    @DisplayName("Pede à API apenas o que falta para o teto, sem gastar cota à toa")
    void pedirSomenteOQueFalta() {
        montar(List.of("ficcao"), 10);
        when(integracaoLivrosService.buscar(eq("ficcao"), eq(0), eq(10))).thenReturn(List.of());

        servico.agendar();
        servico.executar();

        verify(integracaoLivrosService).buscar("ficcao", 0, 10);
    }

    @Test
    @DisplayName("Na última página pede só o restante do teto")
    void ultimaPaginaPedeORestante() {
        montar(List.of("ficcao"), 50);
        when(integracaoLivrosService.buscar(eq("ficcao"), eq(0), eq(40))).thenReturn(paginaCheia());
        when(integracaoLivrosService.buscar(eq("ficcao"), eq(40), eq(10))).thenReturn(List.of());

        servico.agendar();
        servico.executar();

        verify(integracaoLivrosService).buscar("ficcao", 40, 10);
    }

    @Test
    @DisplayName("Percorre todos os temas configurados")
    void percorrerTodosOsTemas() {
        montar(List.of("ficcao", "historia", "tecnologia"), 40);
        when(integracaoLivrosService.buscar(any(), anyInt(), anyInt()))
                .thenReturn(List.of(volume("a")));
        when(importadorLivros.importar(any())).thenReturn(true);

        servico.agendar();
        servico.executar();

        assertThat(servico.progresso().temasConcluidos()).isEqualTo(3);
        assertThat(servico.progresso().importados()).isEqualTo(3);
    }

    @Test
    @DisplayName("Recusa uma segunda importação enquanto a primeira roda")
    void recusarImportacaoConcorrente() {
        servico.agendar();

        assertThatThrownBy(() -> servico.agendar())
                .isInstanceOf(ConflitoException.class)
                .hasMessageContaining("importação em andamento");
    }

    @Test
    @DisplayName("Libera nova importação depois que a anterior termina")
    void liberarAposConcluir() {
        when(integracaoLivrosService.buscar(any(), anyInt(), anyInt())).thenReturn(List.of());

        servico.agendar();
        servico.executar();

        assertThat(servico.progresso().emAndamento()).isFalse();
        servico.agendar();
        assertThat(servico.progresso().emAndamento()).isTrue();
    }

    @Test
    @DisplayName("API fora do ar encerra a importação com mensagem e libera a trava")
    void apiForaDoAr() {
        when(integracaoLivrosService.buscar(any(), anyInt(), anyInt()))
                .thenThrow(new IntegracaoIndisponivelException("Google Books indisponível"));

        servico.agendar();
        servico.executar();

        ProgressoImportacaoDTO resultado = servico.progresso();
        assertThat(resultado.emAndamento()).isFalse();
        assertThat(resultado.mensagem()).contains("interrompida");
        assertThat(resultado.importados()).isZero();
    }

    @Test
    @DisplayName("Zera os contadores a cada nova importação")
    void zerarContadores() {
        when(integracaoLivrosService.buscar(any(), anyInt(), anyInt()))
                .thenReturn(Collections.singletonList(volume("a")));
        when(importadorLivros.importar(any())).thenReturn(true);

        servico.agendar();
        servico.executar();
        assertThat(servico.progresso().importados()).isEqualTo(1);

        servico.agendar();
        assertThat(servico.progresso().importados()).isZero();
    }
}
