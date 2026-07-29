package com.bookmanager.categoria;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.bookmanager.categoria.dto.CategoriaRespostaDTO;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

// Testes da Tradução e do Filtro de Categorias
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class CategoriaServiceTest {

    @Mock
    private CategoriaRepository categoriaRepository;

    @InjectMocks
    private CategoriaService categoriaService;

    private Object[] linha(long id, String nome, String slug, long total) {
        return new Object[] {id, nome, slug, total};
    }

    @Test
    @DisplayName("Traduz os rótulos que o Google devolve em inglês")
    void traduzirRotulos() {
        when(categoriaRepository.listarComLivros(anyLong())).thenReturn(List.<Object[]>of(
                linha(1, "Education", "education", 97),
                linha(2, "Business & Economics", "business-economics", 48),
                linha(3, "Juvenile Fiction", "juvenile-fiction", 12)));

        List<CategoriaRespostaDTO> categorias = categoriaService.listar(10);

        assertThat(categorias).extracting(CategoriaRespostaDTO::nome)
                .containsExactly("Educação", "Negócios e Economia", "Ficção Infantojuvenil");
    }

    @Test
    @DisplayName("Categoria sem tradução mantém o nome original")
    void manterNomeSemTraducao() {
        when(categoriaRepository.listarComLivros(anyLong())).thenReturn(List.<Object[]>of(
                linha(9, "Bibliografija knjiga", "bibliografija-knjiga", 3)));

        assertThat(categoriaService.listar(1))
                .singleElement()
                .extracting(CategoriaRespostaDTO::nome)
                .isEqualTo("Bibliografija knjiga");
    }

    @Test
    @DisplayName("O slug é preservado — a tradução não pode quebrar o filtro")
    void preservarSlug() {
        when(categoriaRepository.listarComLivros(anyLong())).thenReturn(List.<Object[]>of(
                linha(1, "Education", "education", 97)));

        CategoriaRespostaDTO categoria = categoriaService.listar(1).get(0);

        assertThat(categoria.slug()).isEqualTo("education");
        assertThat(categoria.totalLivros()).isEqualTo(97);
    }

    @Test
    @DisplayName("Mínimo abaixo de um vira um, sem consultar com valor inválido")
    void normalizarMinimo() {
        when(categoriaRepository.listarComLivros(anyLong())).thenReturn(List.<Object[]>of());

        categoriaService.listar(0);

        verify(categoriaRepository).listarComLivros(1L);
    }

    @Test
    @DisplayName("Gera slug sem acento nem espaço")
    void gerarSlug() {
        assertThat(CategoriaService.gerarSlug("Ficção Científica")).isEqualTo("ficcao-cientifica");
        assertThat(CategoriaService.gerarSlug("  ")).isEqualTo("geral");
    }
}
