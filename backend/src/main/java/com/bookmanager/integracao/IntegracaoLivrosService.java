package com.bookmanager.integracao;

import com.bookmanager.integracao.dto.VolumeGoogleDTO;
import java.util.List;

// Porta de Consulta a Catalogo Externo de Livros
public interface IntegracaoLivrosService {

    List<VolumeGoogleDTO> buscar(String termo, int inicio, int quantidade);
}
