package com.bookmanager.comentario.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// Entrada de Comentario
public record ComentarioRequestDTO(
        @JsonProperty("text")
        @NotBlank(message = "Escreva algo antes de enviar")
        @Size(max = 2000, message = "O comentário deve ter no máximo 2000 caracteres")
        String texto
) {
}
