package com.bookmanager;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

// Teste de Integracao da API (auth + CRUD) com Postgres real
@Testcontainers
@SpringBootTest
@AutoConfigureMockMvc
class BookManagerApplicationTests {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @Test
    void fluxoCompletoDeAutenticacaoECrud() throws Exception {
        // Registro devolve token (201)
        String corpoRegistro = objectMapper.writeValueAsString(Map.of(
                "nome", "Leitor Teste",
                "email", "leitor@teste.com",
                "senha", "senha123"));
        MvcResult registro = mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON).content(corpoRegistro))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").exists())
                .andReturn();
        String token = extrairToken(registro);

        // Rota protegida sem token = 401
        mockMvc.perform(get("/books")).andExpect(status().isUnauthorized());

        // Login devolve token (200)
        String corpoLogin = objectMapper.writeValueAsString(Map.of(
                "email", "leitor@teste.com", "senha", "senha123"));
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON).content(corpoLogin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists());

        // Criar livro (201)
        String corpoLivro = objectMapper.writeValueAsString(Map.of(
                "titulo", "Dom Casmurro",
                "autor", "Machado de Assis",
                "ano", 1899,
                "descricao", "Ciúme e memória."));
        MvcResult criacao = mockMvc.perform(post("/books/create")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(corpoLivro))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.titulo", is("Dom Casmurro")))
                .andReturn();
        long id = objectMapper.readTree(criacao.getResponse().getContentAsString()).get("id").asLong();

        // Listar com busca por titulo (paginado)
        mockMvc.perform(get("/books").param("titulo", "casmurro")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElementos", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.conteudo[0].autor", is("Machado de Assis")));

        // Buscar por id
        mockMvc.perform(get("/books/{id}", id)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is((int) id)));

        // Atualizar
        String corpoAtualizacao = objectMapper.writeValueAsString(Map.of(
                "titulo", "Dom Casmurro (Ed. Revisada)",
                "autor", "Machado de Assis"));
        mockMvc.perform(put("/books/{id}", id)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(corpoAtualizacao))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.titulo", is("Dom Casmurro (Ed. Revisada)")));

        // Remover (soft delete)
        mockMvc.perform(delete("/books/{id}", id)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isNoContent());

        // Apos remover, 404
        mockMvc.perform(get("/books/{id}", id)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isNotFound());
    }

    private String extrairToken(MvcResult resultado) throws Exception {
        JsonNode corpo = objectMapper.readTree(resultado.getResponse().getContentAsString());
        return corpo.get("token").asText();
    }
}
