package com.bookmanager.avaliacao;

import com.bookmanager.avaliacao.dto.AvaliacaoRequestDTO;
import com.bookmanager.avaliacao.dto.AvaliacaoRespostaDTO;
import com.bookmanager.avaliacao.dto.ResumoAvaliacoesDTO;
import com.bookmanager.comum.excecao.RecursoNaoEncontradoException;
import com.bookmanager.comum.paginacao.RespostaPaginadaDTO;
import com.bookmanager.livro.Livro;
import com.bookmanager.livro.LivroRepository;
import com.bookmanager.usuario.Usuario;
import com.bookmanager.usuario.UsuarioService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// Service de Avaliacoes
@Service
@RequiredArgsConstructor
public class AvaliacaoService {

    private static final int NOTA_MAXIMA = 5;

    private final AvaliacaoRepository avaliacaoRepository;
    private final LivroRepository livroRepository;
    private final UsuarioService usuarioService;

    // Cria ou Substitui a Avaliacao do Proprio Leitor
    @Transactional
    public AvaliacaoRespostaDTO salvar(Long livroId, String email, AvaliacaoRequestDTO requisicao) {
        Usuario usuario = usuarioService.buscarPorEmail(email);
        Livro livro = obterLivro(livroId);

        Avaliacao avaliacao = avaliacaoRepository
                .findByUsuarioIdAndLivroId(usuario.getId(), livroId)
                .orElseGet(() -> novaAvaliacao(usuario, livro));

        avaliacao.setNota(requisicao.nota());
        avaliacao.setResenha(normalizar(requisicao.resenha()));
        avaliacao.setSpoiler(requisicao.spoiler());

        return paraDTO(avaliacaoRepository.save(avaliacao), usuario.getId());
    }

    // Avaliacao do Leitor Autenticado, se Houver
    @Transactional(readOnly = true)
    public Optional<AvaliacaoRespostaDTO> minhaAvaliacao(Long livroId, String email) {
        Usuario usuario = usuarioService.buscarPorEmail(email);
        return avaliacaoRepository.findByUsuarioIdAndLivroId(usuario.getId(), livroId)
                .map(avaliacao -> paraDTO(avaliacao, usuario.getId()));
    }

    @Transactional
    public void remover(Long livroId, String email) {
        Usuario usuario = usuarioService.buscarPorEmail(email);
        Avaliacao avaliacao = avaliacaoRepository
                .findByUsuarioIdAndLivroId(usuario.getId(), livroId)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Você ainda não avaliou este livro"));
        avaliacaoRepository.delete(avaliacao);
    }

    // Vitrine de Resenhas do Livro
    @Transactional(readOnly = true)
    public RespostaPaginadaDTO<AvaliacaoRespostaDTO> listarResenhas(Long livroId, String email,
            Pageable paginacao) {
        Long usuarioId = usuarioService.buscarPorEmail(email).getId();
        return RespostaPaginadaDTO.de(avaliacaoRepository.listarResenhas(livroId, paginacao)
                .map(avaliacao -> paraDTO(avaliacao, usuarioId)));
    }

    // Media e Distribuicao das 5 Barras
    @Transactional(readOnly = true)
    public ResumoAvaliacoesDTO resumo(Long livroId) {
        Map<Integer, Long> porNota = new HashMap<>();
        for (Object[] linha : avaliacaoRepository.contarPorNota(livroId)) {
            porNota.put(((Number) linha[0]).intValue(), ((Number) linha[1]).longValue());
        }

        long total = porNota.values().stream().mapToLong(Long::longValue).sum();
        if (total == 0) {
            return new ResumoAvaliacoesDTO(null, 0, List.of());
        }

        long soma = porNota.entrySet().stream()
                .mapToLong(item -> (long) item.getKey() * item.getValue())
                .sum();
        BigDecimal media = BigDecimal.valueOf(soma)
                .divide(BigDecimal.valueOf(total), 1, RoundingMode.HALF_UP);

        // Da Maior Nota para a Menor
        List<ResumoAvaliacoesDTO.FatiaNota> distribuicao = new ArrayList<>();
        for (int nota = NOTA_MAXIMA; nota >= 1; nota--) {
            long quantidade = porNota.getOrDefault(nota, 0L);
            distribuicao.add(new ResumoAvaliacoesDTO.FatiaNota(
                    nota, quantidade, (int) Math.round(quantidade * 100.0 / total)));
        }

        return new ResumoAvaliacoesDTO(media, total, distribuicao);
    }

    private Avaliacao novaAvaliacao(Usuario usuario, Livro livro) {
        Avaliacao avaliacao = new Avaliacao();
        avaliacao.setUsuario(usuario);
        avaliacao.setLivro(livro);
        return avaliacao;
    }

    private Livro obterLivro(Long livroId) {
        return livroRepository.findById(livroId)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Livro não encontrado: id " + livroId));
    }

    private AvaliacaoRespostaDTO paraDTO(Avaliacao avaliacao, Long usuarioAtualId) {
        return new AvaliacaoRespostaDTO(
                avaliacao.getId(),
                avaliacao.getUsuario().getNome(),
                avaliacao.getNota(),
                avaliacao.getResenha(),
                avaliacao.isSpoiler(),
                avaliacao.getUsuario().getId().equals(usuarioAtualId),
                avaliacao.getCriadoEm(),
                avaliacao.getAtualizadoEm());
    }

    private String normalizar(String texto) {
        return (texto == null || texto.isBlank()) ? null : texto.trim();
    }
}
