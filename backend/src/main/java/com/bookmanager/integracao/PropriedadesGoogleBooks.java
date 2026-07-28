package com.bookmanager.integracao;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

// Configuracao da Integracao com o Google Books
@ConfigurationProperties(prefix = "app.integracao.google-books")
public record PropriedadesGoogleBooks(
        String chaveApi,
        String urlBase,
        List<String> temas,
        int maxPorTema,
        String idioma
) {

    private static final String URL_PADRAO = "https://www.googleapis.com/books/v1/volumes";
    private static final int MAX_PADRAO = 200;

    // Assuntos Varridos na Importacao Quando GOOGLE_BOOKS_TEMAS Nao e Informado
    private static final List<String> TEMAS_PADRAO = List.of(
            "ficção brasileira", "romance", "fantasia", "ficção científica", "suspense",
            "terror", "biografia", "história", "filosofia", "psicologia",
            "tecnologia", "programação", "negócios", "poesia", "literatura infantil",
            "autoajuda", "direito", "medicina", "educação", "gastronomia");

    // Defaults Seguros: a Chave e Opcional (a API Responde sem Ela, com Cota Menor)
    public PropriedadesGoogleBooks {
        chaveApi = limpar(chaveApi);
        urlBase = limpar(urlBase);
        idioma = limpar(idioma);

        if (urlBase == null || urlBase.isBlank()) {
            urlBase = URL_PADRAO;
        }
        if (maxPorTema <= 0) {
            maxPorTema = MAX_PADRAO;
        }
        temas = (temas == null ? List.<String>of() : temas).stream()
                .filter(tema -> tema != null && !tema.isBlank())
                .map(String::strip)
                .toList();
        if (temas.isEmpty()) {
            temas = TEMAS_PADRAO;
        }
    }

    public boolean temChave() {
        return chaveApi != null && !chaveApi.isBlank();
    }

    private static String limpar(String valor) {
        return valor == null ? null : valor.strip();
    }
}
