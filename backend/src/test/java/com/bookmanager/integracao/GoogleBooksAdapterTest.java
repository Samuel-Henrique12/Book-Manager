package com.bookmanager.integracao;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import com.bookmanager.comum.excecao.IntegracaoIndisponivelException;
import com.bookmanager.integracao.dto.VolumeGoogleDTO;
import java.util.List;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.ExpectedCount;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

// Testes do Cliente HTTP: Repeticao em Falha Transitoria
class GoogleBooksAdapterTest {

    private static final String CORPO = """
            {"totalItems":1,"items":[{"id":"abc","volumeInfo":{"title":"Dom Casmurro",
             "authors":["Machado de Assis"]}}]}
            """;

    private RestClient.Builder construtor;
    private MockRestServiceServer servidor;
    private GoogleBooksAdapter adapter;

    @BeforeEach
    void preparar() {
        construtor = RestClient.builder().baseUrl("https://exemplo/volumes");
        servidor = MockRestServiceServer.bindTo(construtor).build();
        PropriedadesGoogleBooks propriedades = new PropriedadesGoogleBooks(
                null, "https://exemplo/volumes", List.of("ficcao"), 40, "pt");
        // Espera curta para o teste nao ficar lento
        adapter = new GoogleBooksAdapter(propriedades, construtor.build(), 5);
    }

    @Test
    @DisplayName("Devolve os volumes quando a API responde de primeira")
    void respostaDeSucesso() {
        servidor.expect(requestTo(Matchers.containsString("q=machado")))
                .andRespond(withSuccess(CORPO, MediaType.APPLICATION_JSON));

        List<VolumeGoogleDTO> volumes = adapter.buscar("machado", 0, 10);

        assertThat(volumes).hasSize(1);
        assertThat(volumes.get(0).volumeInfo().title()).isEqualTo("Dom Casmurro");
        servidor.verify();
    }

    @Test
    @DisplayName("Repete após 503 e entrega o resultado da tentativa seguinte")
    void repetirApos503() {
        servidor.expect(ExpectedCount.once(), requestTo(Matchers.any(String.class)))
                .andRespond(withStatus(HttpStatus.SERVICE_UNAVAILABLE).body("backendFailed"));
        servidor.expect(ExpectedCount.once(), requestTo(Matchers.any(String.class)))
                .andRespond(withSuccess(CORPO, MediaType.APPLICATION_JSON));

        List<VolumeGoogleDTO> volumes = adapter.buscar("machado", 0, 10);

        assertThat(volumes).hasSize(1);
        servidor.verify();
    }

    @Test
    @DisplayName("Repete após 429 de cota momentânea")
    void repetirApos429() {
        servidor.expect(ExpectedCount.once(), requestTo(Matchers.any(String.class)))
                .andRespond(withStatus(HttpStatus.TOO_MANY_REQUESTS).body("rateLimitExceeded"));
        servidor.expect(ExpectedCount.once(), requestTo(Matchers.any(String.class)))
                .andRespond(withSuccess(CORPO, MediaType.APPLICATION_JSON));

        assertThat(adapter.buscar("machado", 0, 10)).hasSize(1);
        servidor.verify();
    }

    @Test
    @DisplayName("Desiste após esgotar as tentativas e sinaliza indisponibilidade")
    void desistirAposTresFalhas() {
        servidor.expect(ExpectedCount.times(3), requestTo(Matchers.any(String.class)))
                .andRespond(withServerError());

        assertThatThrownBy(() -> adapter.buscar("machado", 0, 10))
                .isInstanceOf(IntegracaoIndisponivelException.class)
                .hasMessageContaining("3 tentativas");

        servidor.verify();
    }

    @Test
    @DisplayName("Não repete quando o erro é definitivo — chave inválida")
    void naoRepetirEmErroDefinitivo() {
        servidor.expect(ExpectedCount.once(), requestTo(Matchers.any(String.class)))
                .andRespond(withStatus(HttpStatus.FORBIDDEN).body("keyInvalid"));

        assertThatThrownBy(() -> adapter.buscar("machado", 0, 10))
                .isInstanceOf(IntegracaoIndisponivelException.class)
                .hasMessageContaining("403");

        servidor.verify();
    }

    @Test
    @DisplayName("Resposta sem items vira lista vazia, não erro")
    void respostaSemItens() {
        servidor.expect(requestTo(Matchers.any(String.class)))
                .andRespond(withSuccess("{\"totalItems\":0}", MediaType.APPLICATION_JSON));

        assertThat(adapter.buscar("inexistente", 0, 10)).isEmpty();
        servidor.verify();
    }
}
