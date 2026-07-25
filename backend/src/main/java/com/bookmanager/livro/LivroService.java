package com.bookmanager.livro;

import com.bookmanager.comum.excecao.RecursoNaoEncontradoException;
import com.bookmanager.comum.paginacao.RespostaPaginadaDTO;
import com.bookmanager.livro.dto.LivroRequestDTO;
import com.bookmanager.livro.dto.LivroRespostaDTO;
import com.bookmanager.livro.dto.LivroResumoDTO;
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

    // Listar Livros com Filtro por Título e Paginação
    @Transactional(readOnly = true)
    public RespostaPaginadaDTO<LivroResumoDTO> listar(String titulo, Pageable paginacao) {
        Page<Livro> pagina = (titulo == null || titulo.isBlank())
                ? livroRepository.findAll(paginacao)
                : livroRepository.findByTituloContainingIgnoreCase(titulo.trim(), paginacao);
        return RespostaPaginadaDTO.de(pagina.map(livroMapper::paraResumo));
    }

    // Buscar Livro por ID
    @Transactional(readOnly = true)
    public LivroRespostaDTO buscarPorId(Long id) {
        return livroMapper.paraResposta(obter(id));
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
        Livro livro = obter(id);
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
}
