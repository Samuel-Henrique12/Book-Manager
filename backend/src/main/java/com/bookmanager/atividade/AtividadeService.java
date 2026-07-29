package com.bookmanager.atividade;

import com.bookmanager.atividade.dto.AtividadeDTO;
import com.bookmanager.atividade.dto.AtividadeDTO.TipoAtividade;
import com.bookmanager.avaliacao.Avaliacao;
import com.bookmanager.avaliacao.AvaliacaoRepository;
import com.bookmanager.comentario.Comentario;
import com.bookmanager.comentario.ComentarioRepository;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// Service do Feed: Publicações da Comunidade
@Service
@RequiredArgsConstructor
public class AtividadeService {

    private static final int LIMITE_MAXIMO = 30;
    private static final Sort MAIS_RECENTES = Sort.by(Sort.Direction.DESC, "criadoEm");

    private final AvaliacaoRepository avaliacaoRepository;
    private final ComentarioRepository comentarioRepository;

    // Busca os Mais Recentes de Cada Origem e Intercala por Data
    @Transactional(readOnly = true)
    public List<AtividadeDTO> recentes(int quantidade) {
        int limite = Math.min(Math.max(quantidade, 1), LIMITE_MAXIMO);
        PageRequest paginacao = PageRequest.of(0, limite, MAIS_RECENTES);

        List<AtividadeDTO> eventos = new ArrayList<>();
        avaliacaoRepository.listarUltimasResenhas(paginacao).forEach(a -> eventos.add(daResenha(a)));
        comentarioRepository.findAll(paginacao).forEach(c -> eventos.add(doComentario(c)));

        return eventos.stream()
                .sorted(Comparator.comparing(AtividadeDTO::criadoEm).reversed())
                .limit(limite)
                .toList();
    }

    private AtividadeDTO daResenha(Avaliacao avaliacao) {
        return new AtividadeDTO(
                TipoAtividade.REVIEW,
                avaliacao.getUsuario().getNome(),
                avaliacao.getLivro().getId(),
                avaliacao.getLivro().getTitulo(),
                avaliacao.getLivro().getUrlCapa(),
                avaliacao.getNota(),
                avaliacao.getResenha(),
                avaliacao.isSpoiler(),
                avaliacao.getCriadoEm());
    }

    private AtividadeDTO doComentario(Comentario comentario) {
        return new AtividadeDTO(
                TipoAtividade.COMMENT,
                comentario.getUsuario().getNome(),
                comentario.getLivro().getId(),
                comentario.getLivro().getTitulo(),
                comentario.getLivro().getUrlCapa(),
                null,
                comentario.getTexto(),
                comentario.isSpoiler(),
                comentario.getCriadoEm());
    }
}
