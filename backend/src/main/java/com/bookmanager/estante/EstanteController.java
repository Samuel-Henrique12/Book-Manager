package com.bookmanager.estante;

import com.bookmanager.comum.paginacao.RespostaPaginadaDTO;
import com.bookmanager.estante.dto.EstanteRespostaDTO;
import com.bookmanager.estante.dto.ResumoEstanteDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

// Endpoints da Estante do Leitor Autenticado
@RestController
@RequestMapping("/shelf")
@RequiredArgsConstructor
public class EstanteController {

    private final EstanteService estanteService;

    // Endpoint para Listar a Própria Estante
    @GetMapping
    public ResponseEntity<RespostaPaginadaDTO<EstanteRespostaDTO>> listar(
            @RequestParam(required = false) StatusLeitura status,
            @RequestParam(required = false, defaultValue = "false") boolean favorites,
            @AuthenticationPrincipal UserDetails autenticado,
            @PageableDefault(size = 12, sort = "atualizadoEm", direction = Sort.Direction.DESC)
            Pageable paginacao) {
        return ResponseEntity.ok(
                estanteService.listar(autenticado.getUsername(), status, favorites, paginacao));
    }

    // Endpoint para os Contadores e o Paginômetro
    @GetMapping("/summary")
    public ResponseEntity<ResumoEstanteDTO> resumo(
            @AuthenticationPrincipal UserDetails autenticado) {
        return ResponseEntity.ok(estanteService.resumo(autenticado.getUsername()));
    }
}
