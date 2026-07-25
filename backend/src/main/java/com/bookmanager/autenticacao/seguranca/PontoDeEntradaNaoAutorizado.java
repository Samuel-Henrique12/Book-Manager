package com.bookmanager.autenticacao.seguranca;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

// Resposta 401 para Requisicoes Nao Autenticadas
@Component
@RequiredArgsConstructor
public class PontoDeEntradaNaoAutorizado implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    // Retorna Resposta 401 com Detalhes do Problema
    @Override
    public void commence(HttpServletRequest requisicao, HttpServletResponse resposta,
            AuthenticationException excecao) throws IOException {
        resposta.setStatus(HttpStatus.UNAUTHORIZED.value());
        resposta.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
        ProblemDetail problema = ProblemDetail.forStatusAndDetail(
                HttpStatus.UNAUTHORIZED, "Autenticação necessária para acessar este recurso");
        problema.setTitle("Não autorizado");
        objectMapper.writeValue(resposta.getOutputStream(), problema);
    }
}
