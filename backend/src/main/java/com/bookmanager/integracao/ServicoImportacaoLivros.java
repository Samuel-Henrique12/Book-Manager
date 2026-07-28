package com.bookmanager.integracao;

import com.bookmanager.comum.excecao.ConflitoException;
import com.bookmanager.integracao.dto.ProgressoImportacaoDTO;
import com.bookmanager.integracao.dto.VolumeGoogleDTO;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

// Importacao em Batch do Google Books para o Acervo Local
@Slf4j
@Service
@RequiredArgsConstructor
public class ServicoImportacaoLivros {

    private static final int POR_PAGINA = 40;
    private static final long PAUSA_ENTRE_PAGINAS_MS = 250;

    private final IntegracaoLivrosService integracaoLivrosService;
    private final ImportadorLivros importadorLivros;
    private final ProgressoImportacao progresso;
    private final PropriedadesGoogleBooks propriedades;

    // Reserva a Execucao de Forma Sincrona para Poder Recusar com 409
    public void agendar() {
        if (!progresso.reservar(propriedades.temas().size())) {
            throw new ConflitoException("Já existe uma importação em andamento");
        }
    }

    // Chamado pelo Controller (Bean Distinto) para o Proxy do @Async Valer
    @Async
    public void executar() {
        List<String> temas = propriedades.temas();
        log.info("Importação do Google Books iniciada: {} temas, até {} livros por tema",
                temas.size(), propriedades.maxPorTema());

        try {
            for (String tema : temas) {
                progresso.iniciarTema(tema);
                importarTema(tema);
                progresso.concluirTema();
            }
            progresso.liberar("Importação concluída");
        } catch (RuntimeException ex) {
            log.error("Importação interrompida", ex);
            progresso.liberar("Importação interrompida: " + ex.getMessage());
        } finally {
            log.info("Importação finalizada: {} importados, {} ignorados, {} falhas",
                    progresso.importados(), progresso.ignorados(), progresso.falhas());
        }
    }

    public ProgressoImportacaoDTO progresso() {
        return progresso.instantaneo();
    }

    private void importarTema(String tema) {
        for (int inicio = 0; inicio < propriedades.maxPorTema(); inicio += POR_PAGINA) {
            // A Ultima Pagina Pede So o que Falta para o Teto do Tema
            int quantidade = Math.min(POR_PAGINA, propriedades.maxPorTema() - inicio);
            List<VolumeGoogleDTO> volumes = integracaoLivrosService.buscar(tema, inicio, quantidade);
            if (volumes.isEmpty()) {
                return;
            }
            volumes.forEach(this::importarComSeguranca);
            pausar();
        }
    }

    // Um Volume Problematico Nao Derruba o Lote Inteiro
    private void importarComSeguranca(VolumeGoogleDTO volume) {
        try {
            if (importadorLivros.importar(volume)) {
                progresso.contarImportado();
            } else {
                progresso.contarIgnorado();
            }
        } catch (RuntimeException ex) {
            progresso.contarFalha();
            log.warn("Volume {} descartado: {}", volume.id(), ex.getMessage());
        }
    }

    // Respiro entre Paginas para Nao Estourar a Cota
    private void pausar() {
        try {
            Thread.sleep(PAUSA_ENTRE_PAGINAS_MS);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Importação interrompida");
        }
    }
}
