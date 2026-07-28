package com.bookmanager.integracao;

import com.bookmanager.categoria.Categoria;
import com.bookmanager.categoria.CategoriaService;
import com.bookmanager.integracao.dto.VolumeGoogleDTO;
import com.bookmanager.livro.Livro;
import com.bookmanager.livro.LivroRepository;
import java.util.LinkedHashSet;
import java.util.Optional;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

// Grava um Volume por Transacao: uma Falha Isolada Nao Desfaz o Lote
@Component
@RequiredArgsConstructor
public class ImportadorLivros {

    private final ConversorVolume conversorVolume;
    private final CategoriaService categoriaService;
    private final LivroRepository livroRepository;

    @Transactional
    public boolean importar(VolumeGoogleDTO volume) {
        Optional<Livro> convertido = conversorVolume.converter(volume);
        if (convertido.isEmpty()) {
            return false;
        }

        Livro livro = convertido.get();
        if (jaExiste(livro)) {
            return false;
        }

        livro.setCategorias(resolverCategorias(volume));
        livroRepository.save(livro);
        return true;
    }

    // Deduplica pelo Id do Google e, na Falta Dele, por Titulo + Autor
    private boolean jaExiste(Livro livro) {
        if (livro.getGoogleId() != null
                && livroRepository.findByGoogleId(livro.getGoogleId()).isPresent()) {
            return true;
        }
        return livroRepository.existsByTituloIgnoreCaseAndAutorIgnoreCase(
                livro.getTitulo(), livro.getAutor());
    }

    private Set<Categoria> resolverCategorias(VolumeGoogleDTO volume) {
        Set<Categoria> categorias = new LinkedHashSet<>();
        conversorVolume.categorias(volume)
                .forEach(nome -> categorias.add(categoriaService.obterOuCriar(nome)));
        return categorias;
    }
}
