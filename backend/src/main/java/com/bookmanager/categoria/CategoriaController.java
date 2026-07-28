package com.bookmanager.categoria;

import com.bookmanager.categoria.dto.CategoriaRespostaDTO;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// Endpoints de Categorias
@RestController
@RequestMapping("/categorias")
@RequiredArgsConstructor
public class CategoriaController {

    private final CategoriaService categoriaService;

    // Endpoint para Listar Categorias com Livros
    @GetMapping
    public ResponseEntity<List<CategoriaRespostaDTO>> listar() {
        return ResponseEntity.ok(categoriaService.listar());
    }
}
