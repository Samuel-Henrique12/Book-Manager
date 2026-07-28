package com.bookmanager.usuario;

import com.bookmanager.usuario.dto.ContaRespostaDTO;
import com.bookmanager.usuario.dto.UsuarioRespostaDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

// Map dos Usuario <-> DTO
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UsuarioMapper {

    UsuarioRespostaDTO paraResposta(Usuario usuario);

    @Mapping(target = "podeAdministrar", source = "podeAdministrar")
    ContaRespostaDTO paraConta(Usuario usuario, boolean podeAdministrar);
}
