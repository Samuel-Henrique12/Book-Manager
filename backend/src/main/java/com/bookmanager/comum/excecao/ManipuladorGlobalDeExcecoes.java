package com.bookmanager.comum.excecao;

import java.util.LinkedHashMap;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

// Tratamento Global de Erros (RFC 9457)
@Slf4j
@RestControllerAdvice
public class ManipuladorGlobalDeExcecoes {

    // Exception Handler de Recurso Não Encontrado (404)
    @ExceptionHandler(RecursoNaoEncontradoException.class)
    public ProblemDetail tratarRecursoNaoEncontrado(RecursoNaoEncontradoException ex) {
        return montar(HttpStatus.NOT_FOUND, "Recurso não encontrado", ex.getMessage());
    }

    // Exception Handler de Regra de Negócio Violada (422)
    @ExceptionHandler(RegraDeNegocioException.class)
    public ProblemDetail tratarRegraDeNegocio(RegraDeNegocioException ex) {
        return montar(HttpStatus.UNPROCESSABLE_ENTITY, "Regra de negócio violada", ex.getMessage());
    }

    // Exception Handler de Conflito (409)
    @ExceptionHandler(ConflitoException.class)
    public ProblemDetail tratarConflito(ConflitoException ex) {
        return montar(HttpStatus.CONFLICT, "Conflito", ex.getMessage());
    }

    // Exception Handler de Não Autorizado (401)
    @ExceptionHandler({CredenciaisInvalidasException.class, TokenInvalidoException.class})
    public ProblemDetail tratarNaoAutorizado(RuntimeException ex) {
        return montar(HttpStatus.UNAUTHORIZED, "Não autorizado", ex.getMessage());
    }

    // Exception Handler de Conta Não Confirmada (403)
    @ExceptionHandler(ContaNaoConfirmadaException.class)
    public ProblemDetail tratarContaNaoConfirmada(ContaNaoConfirmadaException ex) {
        return montar(HttpStatus.FORBIDDEN, "Conta não confirmada", ex.getMessage());
    }

    // Exception Handler de Falha no Envio de E-mail (503)
    @ExceptionHandler(FalhaNoEnvioDeEmailException.class)
    public ProblemDetail tratarFalhaDeEmail(FalhaNoEnvioDeEmailException ex) {
        return montar(HttpStatus.SERVICE_UNAVAILABLE, "Serviço de e-mail indisponível", ex.getMessage());
    }

    // Exception Handler de Integração Externa Indisponível (503)
    @ExceptionHandler(IntegracaoIndisponivelException.class)
    public ProblemDetail tratarIntegracaoIndisponivel(IntegracaoIndisponivelException ex) {
        return montar(HttpStatus.SERVICE_UNAVAILABLE, "Serviço externo indisponível", ex.getMessage());
    }

    // Exception Handler de Acesso Negado (403)
    @ExceptionHandler(AccessDeniedException.class)
    public ProblemDetail tratarAcessoNegado(AccessDeniedException ex) {
        return montar(HttpStatus.FORBIDDEN, "Acesso negado",
                "Você não tem permissão para executar esta operação");
    }

    // Exception Handler de Validação de Campos (400)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail tratarValidacao(MethodArgumentNotValidException ex) {
        Map<String, String> campos = new LinkedHashMap<>();
        for (FieldError erro : ex.getBindingResult().getFieldErrors()) {
            campos.putIfAbsent(erro.getField(), erro.getDefaultMessage());
        }
        ProblemDetail problema = montar(HttpStatus.BAD_REQUEST, "Falha de validação",
                "Um ou mais campos são inválidos");
        problema.setProperty("campos", campos);
        return problema;
    }

    // Exception Handler de Erro Interno (500)
    @ExceptionHandler(Exception.class)
    public ProblemDetail tratarErroInterno(Exception ex) {
        log.error("Erro não tratado", ex);
        return montar(HttpStatus.INTERNAL_SERVER_ERROR, "Erro interno",
                "Ocorreu um erro inesperado ao processar a requisição");
    }

    // Monta ProblemDetail com Status, Título e Detalhe
    private ProblemDetail montar(HttpStatus status, String titulo, String detalhe) {
        ProblemDetail problema = ProblemDetail.forStatusAndDetail(status, detalhe);
        problema.setTitle(titulo);
        return problema;
    }
}
