package com.bookmanager.integracao;

import com.bookmanager.comum.excecao.IntegracaoIndisponivelException;
import com.bookmanager.integracao.dto.VolumeGoogleDTO;
import java.net.URI;
import java.util.List;
import java.util.Set;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.util.UriBuilder;

// Cliente HTTP do Google Books
@Slf4j
@Service
public class GoogleBooksAdapter implements IntegracaoLivrosService {

    private static final int MAXIMO_POR_PAGINA = 40;
    private static final int TENTATIVAS = 3;
    private static final long ESPERA_INICIAL_MS = 1000;

    // O Google Responde 503/backendFailed e 429 sob Carga; Ambos Passam ao Repetir
    private static final Set<Integer> TRANSITORIOS = Set.of(408, 429, 500, 502, 503, 504);

    private final PropriedadesGoogleBooks propriedades;
    private final RestClient cliente;
    private final long esperaInicialMs;

    @Autowired
    public GoogleBooksAdapter(PropriedadesGoogleBooks propriedades,
            @Qualifier("clienteGoogleBooks") RestClient cliente) {
        this(propriedades, cliente, ESPERA_INICIAL_MS);
    }

    // Construtor de Teste: Espera Curta para Nao Arrastar a Suite
    GoogleBooksAdapter(PropriedadesGoogleBooks propriedades, RestClient cliente,
            long esperaInicialMs) {
        this.propriedades = propriedades;
        this.cliente = cliente;
        this.esperaInicialMs = esperaInicialMs;
    }

    // Busca Paginada com Repeticao e Espera Progressiva
    @Override
    public List<VolumeGoogleDTO> buscar(String termo, int inicio, int quantidade) {
        int limite = Math.min(Math.max(quantidade, 1), MAXIMO_POR_PAGINA);
        long espera = esperaInicialMs;

        for (int tentativa = 1; tentativa <= TENTATIVAS; tentativa++) {
            try {
                return consultar(termo, inicio, limite);
            } catch (RestClientResponseException ex) {
                exigirTransitorio(ex.getStatusCode(), termo, ex.getStatusText());
                registrarRepeticao(termo, tentativa, ex.getStatusCode().value() + "");
            } catch (ResourceAccessException ex) {
                registrarRepeticao(termo, tentativa, "falha de rede");
            }

            if (tentativa < TENTATIVAS) {
                aguardar(espera);
                espera *= 2;
            }
        }

        throw new IntegracaoIndisponivelException(
                "O Google Books não respondeu após %d tentativas.".formatted(TENTATIVAS));
    }

    private List<VolumeGoogleDTO> consultar(String termo, int inicio, int limite) {
        VolumeGoogleDTO.Pagina pagina = cliente.get()
                .uri(construtor -> montarUri(construtor, termo, inicio, limite))
                .retrieve()
                .body(VolumeGoogleDTO.Pagina.class);

        return (pagina == null || pagina.items() == null) ? List.of() : pagina.items();
    }

    // Erro Definitivo (Chave Invalida, Requisicao Ruim) Nao Melhora com Repeticao
    private void exigirTransitorio(HttpStatusCode status, String termo, String detalhe) {
        if (!TRANSITORIOS.contains(status.value())) {
            log.error("Google Books recusou a consulta '{}': {} {}", termo, status.value(), detalhe);
            throw new IntegracaoIndisponivelException(
                    "O Google Books recusou a consulta (HTTP %d).".formatted(status.value()));
        }
    }

    private void registrarRepeticao(String termo, int tentativa, String causa) {
        log.warn("Google Books indisponível para '{}' ({}), tentativa {}/{}",
                termo, causa, tentativa, TENTATIVAS);
    }

    private void aguardar(long milissegundos) {
        try {
            Thread.sleep(milissegundos);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IntegracaoIndisponivelException("Consulta ao Google Books interrompida");
        }
    }

    // A Chave Vai na Query e Nunca em Log
    private URI montarUri(UriBuilder construtor, String termo, int inicio, int limite) {
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
