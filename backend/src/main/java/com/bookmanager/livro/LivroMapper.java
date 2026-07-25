package com.bookmanager.livro;

import com.bookmanager.livro.dto.LivroRequestDTO;
import com.bookmanager.livro.dto.LivroRespostaDTO;
import com.bookmanager.livro.dto.LivroResumoDTO;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

// Map dos Livro <-> DTO
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface LivroMapper {

    LivroRespostaDTO paraResposta(Livro livro);

    LivroResumoDTO paraResumo(Livro livro);

    Livro paraEntidade(LivroRequestDTO requisicao);

    void atualizar(LivroRequestDTO requisicao, @MappingTarget Livro livro);
}
