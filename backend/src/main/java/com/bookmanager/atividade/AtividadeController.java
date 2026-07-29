package com.bookmanager.atividade;

import com.bookmanager.atividade.dto.AtividadeDTO;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

// Endpoint do Feed da Comunidade
@RestController
@RequestMapping("/activity")
@RequiredArgsConstructor
public class AtividadeController {

    private final AtividadeService atividadeService;

    // Endpoint para as Últimas Resenhas e Comentários do Acervo
    @GetMapping
    public ResponseEntity<List<AtividadeDTO>> recentes(
            @RequestParam(required = false, defaultValue = "8") int size) {
        return ResponseEntity.ok(atividadeService.recentes(size));
    }
}
