package com.bookmanager.integracao;

import com.bookmanager.integracao.dto.ProgressoImportacaoDTO;
import com.bookmanager.integracao.dto.VolumeGoogleDTO;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

// Endpoints da Integracao com o Google Books
@RestController
@RequestMapping("/integracao")
@RequiredArgsConstructor
public class IntegracaoController {

    private static final int RESULTADOS_DA_BUSCA = 10;

    private final ServicoImportacaoLivros servicoImportacaoLivros;
    private final IntegracaoLivrosService integracaoLivrosService;

    // Endpoint para Disparar a Importação em Batch
    @PostMapping("/importar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProgressoImportacaoDTO> importar() {
        servicoImportacaoLivros.agendar();
        servicoImportacaoLivros.executar();
        return ResponseEntity.accepted().body(servicoImportacaoLivros.progresso());
    }

    // Endpoint para Acompanhar a Importação
    @GetMapping("/importacao")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProgressoImportacaoDTO> progresso() {
        return ResponseEntity.ok(servicoImportacaoLivros.progresso());
    }

    // Endpoint para Autopreencher o Formulário a Partir do Google Books
    @GetMapping("/buscar")
    public ResponseEntity<List<VolumeGoogleDTO>> buscar(@RequestParam String q) {
        if (q == null || q.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        return ResponseEntity.ok(integracaoLivrosService.buscar(q.trim(), 0, RESULTADOS_DA_BUSCA));
    }
}
