package com.bookmanager.categoria;

import com.bookmanager.categoria.dto.CategoriaRespostaDTO;
import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// Service de Categorias
@Service
@RequiredArgsConstructor
public class CategoriaService {

    private static final int TAMANHO_MAXIMO = 120;

    private final CategoriaRepository categoriaRepository;

    // Listar Categorias que Possuem Livros
    @Transactional(readOnly = true)
    public List<CategoriaRespostaDTO> listar() {
        return categoriaRepository.listarComLivros().stream()
                .map(categoria -> new CategoriaRespostaDTO(
                        categoria.getId(), categoria.getNome(), categoria.getSlug()))
                .toList();
    }

    // Reaproveita a Categoria Existente ou Cria pelo Slug
    @Transactional
    public Categoria obterOuCriar(String nome) {
        String nomeLimpo = truncar(nome.trim());
        String slug = gerarSlug(nomeLimpo);
        return categoriaRepository.findBySlug(slug)
                .orElseGet(() -> categoriaRepository.save(new Categoria(nomeLimpo, slug)));
    }

    // Texto Livre do Google Vira Identificador de URL
    public static String gerarSlug(String texto) {
        String semAcento = Normalizer.normalize(texto, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        String slug = semAcento.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
        return truncar(slug.isBlank() ? "geral" : slug);
    }

    private static String truncar(String valor) {
        return valor.length() > TAMANHO_MAXIMO ? valor.substring(0, TAMANHO_MAXIMO) : valor;
    }
}
