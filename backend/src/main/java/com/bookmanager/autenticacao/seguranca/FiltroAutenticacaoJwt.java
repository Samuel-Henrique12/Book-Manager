package com.bookmanager.autenticacao.seguranca;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

// Filtro de Autenticacao por Bearer Token
@Component
@RequiredArgsConstructor
public class FiltroAutenticacaoJwt extends OncePerRequestFilter {

    // Prefixo do Token JWT no Header Authorization
    private static final String PREFIXO_BEARER = "Bearer ";
    private final ServicoTokenJwt servicoTokenJwt;
    private final DetalhesUsuarioService detalhesUsuarioService;

    // Filtra Requisições e Autentica Usuario se Token JWT for Valido
    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest requisicao,
            @NonNull HttpServletResponse resposta,
            @NonNull FilterChain cadeia) throws ServletException, IOException {

        // Extrai Token JWT do Header Authorization
        String cabecalho = requisicao.getHeader(HttpHeaders.AUTHORIZATION);
        if (cabecalho != null && cabecalho.startsWith(PREFIXO_BEARER)) {
            String token = cabecalho.substring(PREFIXO_BEARER.length());
            if (servicoTokenJwt.valido(token)
                    && SecurityContextHolder.getContext().getAuthentication() == null) {
                String email = servicoTokenJwt.extrairEmail(token);
                UserDetails usuario = detalhesUsuarioService.loadUserByUsername(email);
                UsernamePasswordAuthenticationToken autenticacao = new UsernamePasswordAuthenticationToken(
                        usuario, null, usuario.getAuthorities());
                autenticacao.setDetails(new WebAuthenticationDetailsSource().buildDetails(requisicao));
                SecurityContextHolder.getContext().setAuthentication(autenticacao);
            }
        }
        cadeia.doFilter(requisicao, resposta);
    }
}
