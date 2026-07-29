package com.bookmanager.livro;

import com.bookmanager.avaliacao.AvaliacaoRepository;
import com.bookmanager.comum.excecao.RecursoNaoEncontradoException;
import com.bookmanager.comum.paginacao.RespostaPaginadaDTO;
import com.bookmanager.estante.Estante;
import com.bookmanager.estante.EstanteService;
import com.bookmanager.livro.dto.LivroRequestDTO;
import com.bookmanager.livro.dto.LivroRespostaDTO;
import com.bookmanager.livro.dto.LivroResumoDTO;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// Service de Livros
@Service
@RequiredArgsConstructor
public class LivroService {

    private final LivroRepository livroRepository;
    private final LivroMapper livroMapper;
    private final EstanteService estanteService;
    private final AvaliacaoRepository avaliacaoRepository;

    // Listar Livros com Filtro por Título, Categoria e Paginação
    @Transactional(readOnly = true)
    public RespostaPaginadaDTO<LivroResumoDTO> listar(String titulo, String categoria,
            String email, Pageable paginacao) {
        Page<Livro> pagina = livroRepository.buscar(
                curinga(titulo), categoria == null ? "" : categoria.trim(), paginacao);

        // Duas Consultas em Lote Cobrem a Pagina Inteira: Estante e Nota da Comunidade
        List<Long> ids = pagina.getContent().stream().map(Livro::getId).toList();
        Map<Long, Estante> estantes = estanteService.porLivros(email, ids);
        Map<Long, NotaDaComunidade> notas = notasDaComunidade(ids);

        return RespostaPaginadaDTO.de(pagina.map(livro -> {
            LivroResumoDTO resumo = livroMapper.paraResumo(livro);

            Estante estante = estantes.get(livro.getId());
            if (estante != null) {
                resumo = resumo.comEstante(estante.getStatus(), estante.isFavorito());
            }

            NotaDaComunidade nota = notas.get(livro.getId());
            return nota == null ? resumo : resumo.comComunidade(nota.media(), nota.total());
        }));
    }

    // Buscar Livro por ID
    @Transactional(readOnly = true)
    public LivroRespostaDTO buscarPorId(Long id) {
        return livroMapper.paraResposta(obterComCategorias(id));
    }

    // Criar Novo Livro
    @Transactional
    public LivroRespostaDTO criar(LivroRequestDTO requisicao) {
        Livro livro = livroMapper.paraEntidade(requisicao);
        return livroMapper.paraResposta(livroRepository.save(livro));
    }

    // Atualizar Livro por ID
    @Transactional
    public LivroRespostaDTO atualizar(Long id, LivroRequestDTO requisicao) {
        Livro livro = obterComCategorias(id);
        livroMapper.atualizar(requisicao, livro);
        return livroMapper.paraResposta(livroRepository.save(livro));
    }

    // Remover Livro por ID
    @Transactional
    public void remover(Long id) {
        livroRepository.delete(obter(id));
    }

    // Obter Livro por ID ou Try Exception
    private Livro obter(Long id) {
        return livroRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Livro não encontrado: id " + id));
    }

    private Livro obterComCategorias(Long id) {
        return livroRepository.findWithCategoriasById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Livro não encontrado: id " + id));
    }

    // Media Arredondada Como no Resumo da Pagina do Livro
    private Map<Long, NotaDaComunidade> notasDaComunidade(List<Long> ids) {
        if (ids.isEmpty()) {
            return Map.of();
        }

        Map<Long, NotaDaComunidade> notas = new HashMap<>();
        for (Object[] linha : avaliacaoRepository.resumirPorLivros(ids)) {
            Long livroId = ((Number) linha[0]).longValue();
            BigDecimal media = BigDecimal.valueOf(((Number) linha[1]).doubleValue())
                    .setScale(1, RoundingMode.HALF_UP);
            notas.put(livroId, new NotaDaComunidade(media, ((Number) linha[2]).longValue()));
        }
        return notas;
    }

    private record NotaDaComunidade(BigDecimal media, Long total) {
    }

    // Busca Vazia Vira "%" e Casa com Todo o Acervo
    private String curinga(String titulo) {
        return (titulo == null || titulo.isBlank()) ? "%" : "%" + titulo.trim() + "%";
    }
}
