package com.bookmanager.integracao;

import static org.assertj.core.api.Assertions.assertThat;

import com.bookmanager.integracao.dto.VolumeGoogleDTO;
import com.bookmanager.integracao.dto.VolumeGoogleDTO.Identificador;
import com.bookmanager.integracao.dto.VolumeGoogleDTO.Imagens;
import com.bookmanager.integracao.dto.VolumeGoogleDTO.InformacoesVolume;
import com.bookmanager.livro.Livro;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Testes da Traducao Volume -> Livro
class ConversorVolumeTest {

    private final ConversorVolume conversor = new ConversorVolume();

    private VolumeGoogleDTO volume(InformacoesVolume info) {
        return new VolumeGoogleDTO("abc123", info);
    }

    private InformacoesVolume completo() {
        return new InformacoesVolume(
                "Dom Casmurro", "Edição comentada", List.of("Machado de Assis", "Org. Fulano"),
                "Editora Teste", "1899-05-10", "Bentinho e Capitu.",
                List.of(new Identificador("ISBN_10", "8535902775"),
                        new Identificador("ISBN_13", "9788535902778")),
                256, List.of("Fiction", "Classics"), new BigDecimal("4.35"), 128, "pt",
                new Imagens("http://livros/pequena.jpg", "http://livros/capa.jpg"),
                "http://livros/previa");
    }

    @Test
    @DisplayName("Converte um volume completo preenchendo todos os campos")
    void converterVolumeCompleto() {
        Livro livro = conversor.converter(volume(completo())).orElseThrow();

        assertThat(livro.getGoogleId()).isEqualTo("abc123");
        assertThat(livro.getTitulo()).isEqualTo("Dom Casmurro");
        assertThat(livro.getSubtitulo()).isEqualTo("Edição comentada");
        assertThat(livro.getAutor()).isEqualTo("Machado de Assis, Org. Fulano");
        assertThat(livro.getEditora()).isEqualTo("Editora Teste");
        assertThat(livro.getDataPublicacao()).isEqualTo("1899-05-10");
        assertThat(livro.getAno()).isEqualTo(1899);
        assertThat(livro.getTotalPaginas()).isEqualTo(256);
        assertThat(livro.getIdioma()).isEqualTo("pt");
        assertThat(livro.getTotalAvaliacoes()).isEqualTo(128);
    }

    @Test
    @DisplayName("Prefere o ISBN-13 quando os dois estão presentes")
    void preferirIsbn13() {
        Livro livro = conversor.converter(volume(completo())).orElseThrow();

        assertThat(livro.getIsbn()).isEqualTo("9788535902778");
    }

    @Test
    @DisplayName("Reescreve capa e prévia para https")
    void reescreverParaHttps() {
        Livro livro = conversor.converter(volume(completo())).orElseThrow();

        assertThat(livro.getUrlCapa()).isEqualTo("https://livros/capa.jpg");
        assertThat(livro.getLinkPrevia()).isEqualTo("https://livros/previa");
    }

    @Test
    @DisplayName("Arredonda a nota para uma casa decimal")
    void arredondarNota() {
        Livro livro = conversor.converter(volume(completo())).orElseThrow();

        assertThat(livro.getMediaAvaliacao()).isEqualByComparingTo(new BigDecimal("4.4"));
    }

    @Test
    @DisplayName("Trunca a descrição que passa do limite da coluna")
    void truncarDescricaoLonga() {
        InformacoesVolume info = new InformacoesVolume("Título", null, List.of("Autor"), null, null,
                "x".repeat(9000), null, null, null, null, null, null, null, null);

        Livro livro = conversor.converter(volume(info)).orElseThrow();

        assertThat(livro.getDescricao()).hasSize(5000);
    }

    @Test
    @DisplayName("Usa autor padrão quando o volume não traz autores")
    void autorAusente() {
        InformacoesVolume info = new InformacoesVolume("Título", null, null, null, null, null,
                null, null, null, null, null, null, null, null);

        Livro livro = conversor.converter(volume(info)).orElseThrow();

        assertThat(livro.getAutor()).isEqualTo("Autor desconhecido");
    }

    @Test
    @DisplayName("Descarta volume sem título")
    void descartarSemTitulo() {
        InformacoesVolume info = new InformacoesVolume("  ", null, List.of("Autor"), null, null,
                null, null, null, null, null, null, null, null, null);

        assertThat(conversor.converter(volume(info))).isEmpty();
    }

    @Test
    @DisplayName("Descarta volume sem informações")
    void descartarSemInformacoes() {
        assertThat(conversor.converter(new VolumeGoogleDTO("id", null))).isEmpty();
        assertThat(conversor.converter(null)).isEmpty();
    }

    @Test
    @DisplayName("Ignora ano fora da faixa aceita pela coluna")
    void ignorarAnoInvalido() {
        InformacoesVolume info = new InformacoesVolume("Título", null, List.of("Autor"), null,
                "2999-01-01", null, null, null, null, null, null, null, null, null);

        assertThat(conversor.converter(volume(info)).orElseThrow().getAno()).isNull();
    }

    @Test
    @DisplayName("Extrai o ano de data parcial")
    void extrairAnoDeDataParcial() {
        InformacoesVolume info = new InformacoesVolume("Título", null, List.of("Autor"), null,
                "2004", null, null, null, null, null, null, null, null, null);

        assertThat(conversor.converter(volume(info)).orElseThrow().getAno()).isEqualTo(2004);
    }

    @Test
    @DisplayName("Zera páginas e avaliações não positivas")
    void descartarValoresNaoPositivos() {
        InformacoesVolume info = new InformacoesVolume("Título", null, List.of("Autor"), null, null,
                null, null, 0, null, BigDecimal.ZERO, 0, null, null, null);

        Livro livro = conversor.converter(volume(info)).orElseThrow();

        assertThat(livro.getTotalPaginas()).isNull();
        assertThat(livro.getMediaAvaliacao()).isNull();
        assertThat(livro.getTotalAvaliacoes()).isNull();
    }

    @Test
    @DisplayName("Lista as categorias sem repetição e sem vazios")
    void listarCategorias() {
        InformacoesVolume info = new InformacoesVolume("Título", null, List.of("Autor"), null, null,
                null, null, null, java.util.Arrays.asList("Fiction", " Fiction", "  ", null),
                null, null, null, null, null);

        assertThat(conversor.categorias(volume(info))).containsExactly("Fiction");
    }

    @Test
    @DisplayName("Gera slug de categoria sem acento nem espaço")
    void gerarSlug() {
        assertThat(com.bookmanager.categoria.CategoriaService.gerarSlug("Ficção Científica"))
                .isEqualTo("ficcao-cientifica");
        assertThat(com.bookmanager.categoria.CategoriaService.gerarSlug("  ")).isEqualTo("geral");
    }

    @Test
    @DisplayName("Converte volume mínimo sem quebrar")
    void converterVolumeMinimo() {
        InformacoesVolume info = new InformacoesVolume("Só o título", null, null, null, null, null,
                null, null, null, null, null, null, null, null);

        Optional<Livro> convertido = conversor.converter(volume(info));

        assertThat(convertido).isPresent();
        assertThat(convertido.get().getTitulo()).isEqualTo("Só o título");
        assertThat(convertido.get().getUrlCapa()).isNull();
        assertThat(convertido.get().getIsbn()).isNull();
    }
}
