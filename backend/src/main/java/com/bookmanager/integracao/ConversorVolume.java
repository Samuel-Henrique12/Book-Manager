package com.bookmanager.integracao;

import com.bookmanager.integracao.dto.VolumeGoogleDTO;
import com.bookmanager.livro.Livro;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

// Traduz o Volume do Google para a Nossa Entidade
@Component
public class ConversorVolume {

    private static final int MAX_TITULO = 250;
    private static final int MAX_SUBTITULO = 300;
    private static final int MAX_AUTOR = 200;
    private static final int MAX_DESCRICAO = 5000;
    private static final int MAX_URL = 500;
    private static final int MAX_ISBN = 20;
    private static final int MAX_EDITORA = 200;
    private static final int MAX_IDIOMA = 10;
    private static final int MAX_DATA = 20;
    private static final int MAX_GOOGLE_ID = 64;

    private static final Pattern ANO = Pattern.compile("(\\d{4})");
    private static final String AUTOR_DESCONHECIDO = "Autor desconhecido";

    // Volume sem Titulo Nao Vira Livro
    public Optional<Livro> converter(VolumeGoogleDTO volume) {
        if (volume == null || volume.volumeInfo() == null) {
            return Optional.empty();
        }

        VolumeGoogleDTO.InformacoesVolume info = volume.volumeInfo();
        if (info.title() == null || info.title().isBlank()) {
            return Optional.empty();
        }

        Livro livro = new Livro();
        livro.setGoogleId(cortar(volume.id(), MAX_GOOGLE_ID));
        livro.setTitulo(cortar(info.title().trim(), MAX_TITULO));
        livro.setSubtitulo(cortar(info.subtitle(), MAX_SUBTITULO));
        livro.setAutor(cortar(juntarAutores(info.authors()), MAX_AUTOR));
        livro.setEditora(cortar(info.publisher(), MAX_EDITORA));
        livro.setDataPublicacao(cortar(info.publishedDate(), MAX_DATA));
        livro.setAno(extrairAno(info.publishedDate()));
        livro.setDescricao(cortar(info.description(), MAX_DESCRICAO));
        livro.setIsbn(cortar(escolherIsbn(info.industryIdentifiers()), MAX_ISBN));
        livro.setTotalPaginas(positivo(info.pageCount()));
        livro.setIdioma(cortar(info.language(), MAX_IDIOMA));
        livro.setMediaAvaliacao(nota(info.averageRating()));
        livro.setTotalAvaliacoes(positivo(info.ratingsCount()));
        livro.setUrlCapa(cortar(comHttps(capa(info.imageLinks())), MAX_URL));
        livro.setLinkPrevia(cortar(comHttps(info.previewLink()), MAX_URL));

        return Optional.of(livro);
    }

    public List<String> categorias(VolumeGoogleDTO volume) {
        List<String> categorias = volume.volumeInfo().categories();
        return categorias == null ? List.of() : categorias.stream()
                .filter(categoria -> categoria != null && !categoria.isBlank())
                .map(String::trim)
                .distinct()
                .toList();
    }

    private String juntarAutores(List<String> autores) {
        if (autores == null || autores.isEmpty()) {
            return AUTOR_DESCONHECIDO;
        }
        String juntos = String.join(", ", autores.stream().filter(a -> a != null && !a.isBlank()).toList());
        return juntos.isBlank() ? AUTOR_DESCONHECIDO : juntos;
    }

    // O Google Devolve "2004", "2004-10" ou "2004-10-31"
    private Integer extrairAno(String dataPublicacao) {
        if (dataPublicacao == null) {
            return null;
        }
        Matcher encontrado = ANO.matcher(dataPublicacao);
        if (!encontrado.find()) {
            return null;
        }
        int ano = Integer.parseInt(encontrado.group(1));
        return (ano >= 1 && ano <= 2100) ? ano : null;
    }

    // ISBN-13 Tem Prioridade sobre ISBN-10
    private String escolherIsbn(List<VolumeGoogleDTO.Identificador> identificadores) {
        if (identificadores == null) {
            return null;
        }
        return identificadores.stream()
                .filter(id -> id.identifier() != null && "ISBN_13".equals(id.type()))
                .map(VolumeGoogleDTO.Identificador::identifier)
                .findFirst()
                .orElseGet(() -> identificadores.stream()
                        .filter(id -> id.identifier() != null && "ISBN_10".equals(id.type()))
                        .map(VolumeGoogleDTO.Identificador::identifier)
                        .findFirst()
                        .orElse(null));
    }

    private String capa(VolumeGoogleDTO.Imagens imagens) {
        if (imagens == null) {
            return null;
        }
        return imagens.thumbnail() != null ? imagens.thumbnail() : imagens.smallThumbnail();
    }

    // Capa em http Seria Bloqueada como Conteudo Misto no Navegador
    private String comHttps(String url) {
        if (url == null) {
            return null;
        }
        return url.startsWith("http://") ? url.replaceFirst("^http://", "https://") : url;
    }

    private BigDecimal nota(BigDecimal media) {
        if (media == null || media.signum() <= 0) {
            return null;
        }
        return media.setScale(1, java.math.RoundingMode.HALF_UP);
    }

    private Integer positivo(Integer valor) {
        return (valor == null || valor <= 0) ? null : valor;
    }

    private String cortar(String valor, int maximo) {
        if (valor == null) {
            return null;
        }
        String limpo = valor.trim();
        if (limpo.isEmpty()) {
            return null;
        }
        return limpo.length() > maximo ? limpo.substring(0, maximo) : limpo;
    }
}
