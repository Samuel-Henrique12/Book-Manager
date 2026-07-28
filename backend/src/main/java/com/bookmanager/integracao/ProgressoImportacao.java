package com.bookmanager.integracao;

import com.bookmanager.integracao.dto.ProgressoImportacaoDTO;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.stereotype.Component;

// Estado Compartilhado da Importacao em Andamento
@Component
public class ProgressoImportacao {

    private final AtomicBoolean emAndamento = new AtomicBoolean(false);
    private final AtomicInteger importados = new AtomicInteger();
    private final AtomicInteger ignorados = new AtomicInteger();
    private final AtomicInteger falhas = new AtomicInteger();
    private final AtomicInteger temasConcluidos = new AtomicInteger();

    private volatile String temaAtual;
    private volatile int totalTemas;
    private volatile String mensagem;

    // Retorna Falso Quando Ja Existe Importacao Rodando
    public boolean reservar(int totalDeTemas) {
        if (!emAndamento.compareAndSet(false, true)) {
            return false;
        }
        importados.set(0);
        ignorados.set(0);
        falhas.set(0);
        temasConcluidos.set(0);
        totalTemas = totalDeTemas;
        temaAtual = null;
        mensagem = "Importação em andamento";
        return true;
    }

    public void liberar(String mensagemFinal) {
        temaAtual = null;
        mensagem = mensagemFinal;
        emAndamento.set(false);
    }

    public void iniciarTema(String tema) {
        temaAtual = tema;
    }

    public void concluirTema() {
        temasConcluidos.incrementAndGet();
    }

    public void contarImportado() {
        importados.incrementAndGet();
    }

    public void contarIgnorado() {
        ignorados.incrementAndGet();
    }

    public void contarFalha() {
        falhas.incrementAndGet();
    }

    public int importados() {
        return importados.get();
    }

    public int ignorados() {
        return ignorados.get();
    }

    public int falhas() {
        return falhas.get();
    }

    public ProgressoImportacaoDTO instantaneo() {
        return new ProgressoImportacaoDTO(emAndamento.get(), importados.get(), ignorados.get(),
                falhas.get(), temaAtual, temasConcluidos.get(), totalTemas, mensagem);
    }
}
