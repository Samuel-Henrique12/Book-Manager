package com.bookmanager.livro.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// Dados de Entrada de Livro
public record LivroRequestDTO(
        @NotBlank(message = "O título é obrigatório")
        @Size(max = 250, message = "O título deve ter no máximo 250 caracteres")
        String titulo,

        @NotBlank(message = "O autor é obrigatório")
        @Size(max = 200, message = "O autor deve ter no máximo 200 caracteres")
        String autor,

        @Min(value = 1, message = "O ano deve ser maior que zero")
        @Max(value = 2100, message = "O ano é inválido")
        Integer ano,

        @Size(max = 5000, message = "A descrição deve ter no máximo 5000 caracteres")
        String descricao,

        @Size(max = 500, message = "A URL da capa deve ter no máximo 500 caracteres")
        String urlCapa,

        @Size(max = 20, message = "O ISBN deve ter no máximo 20 caracteres")
        String isbn,

        @Min(value = 1, message = "O total de páginas deve ser maior que zero")
        Integer totalPaginas
) {
}
