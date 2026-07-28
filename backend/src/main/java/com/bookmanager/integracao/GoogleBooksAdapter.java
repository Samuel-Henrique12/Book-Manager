package com.bookmanager.integracao;

import com.bookmanager.comum.excecao.IntegracaoIndisponivelException;
import com.bookmanager.integracao.dto.VolumeGoogleDTO;
import java.net.http.HttpClient;
import java.time.Duration;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.util.UriBuilder;

// Cliente HTTP do Google Books
@Slf4j
@Service
public class GoogleBooksAdapter implements IntegracaoLivrosService {

    private static final int MAXIMO_POR_PAGINA = 40;

    private final PropriedadesGoogleBooks propriedades;
    private final RestClient cliente;

    public GoogleBooksAdapter(PropriedadesGoogleBooks propriedades) {
        this.propriedades = propriedades;

        JdkClientHttpRequestFactory fabrica = new JdkClientHttpRequestFactory(
                HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build());
        fabrica.setReadTimeout(Duration.ofSeconds(15));

        this.cliente = RestClient.builder()
                .requestFactory(fabrica)
                .baseUrl(propriedades.urlBase())
                .defaultHeader("accept", "application/json")
                .build();
    }

    // Busca Paginada de Volumes
    @Override
    public List<VolumeGoogleDTO> buscar(String termo, int inicio, int quantidade) {
        int limite = Math.min(Math.max(quantidade, 1), MAXIMO_POR_PAGINA);

        try {
            VolumeGoogleDTO.Pagina pagina = cliente.get()
                    .uri(construtor -> montarUri(construtor, termo, inicio, limite))
                    .retrieve()
                    .body(VolumeGoogleDTO.Pagina.class);

            return (pagina == null || pagina.items() == null) ? List.of() : pagina.items();
        } catch (RestClientException ex) {
            log.error("Falha ao consultar o Google Books para o termo '{}': {}", termo, ex.getMessage());
            throw new IntegracaoIndisponivelException(
                    "Não foi possível consultar o Google Books agora. Tente novamente em alguns instantes.");
        }
    }

    // A Chave Vai na Query e Nunca em Log
    private java.net.URI montarUri(UriBuilder construtor, String termo, int inicio, int limite) {
        construtor.queryParam("q", termo)
                .queryParam("startIndex", inicio)
                .queryParam("maxResults", limite)
                .queryParam("printType", "books");

        if (propriedades.idioma() != null && !propriedades.idioma().isBlank()) {
            construtor.queryParam("langRestrict", propriedades.idioma());
        }
        if (propriedades.temChave()) {
            construtor.queryParam("key", propriedades.chaveApi());
        }
        return construtor.build();
    }
}
