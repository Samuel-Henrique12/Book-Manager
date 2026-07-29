package com.bookmanager.estante;

import com.bookmanager.comum.excecao.RecursoNaoEncontradoException;
import com.bookmanager.comum.excecao.RegraDeNegocioException;
import com.bookmanager.comum.paginacao.RespostaPaginadaDTO;
import com.bookmanager.estante.dto.EstanteRequestDTO;
import com.bookmanager.estante.dto.EstanteRespostaDTO;
import com.bookmanager.estante.dto.ResumoEstanteDTO;
import com.bookmanager.livro.Livro;
import com.bookmanager.livro.LivroMapper;
import com.bookmanager.livro.LivroRepository;
import com.bookmanager.usuario.Usuario;
import com.bookmanager.usuario.UsuarioService;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// Service da Estante
@Service
@RequiredArgsConstructor
public class EstanteService {

    private final EstanteRepository estanteRepository;
    private final LivroRepository livroRepository;
    private final LivroMapper livroMapper;
    private final UsuarioService usuarioService;

    // Cria ou Atualiza a Vaga do Livro na Estante do Leitor
    @Transactional
    public EstanteRespostaDTO salvar(Long livroId, String email, EstanteRequestDTO requisicao) {
        Usuario usuario = usuarioService.buscarPorEmail(email);
        Livro livro = obterLivro(livroId);

        Estante estante = estanteRepository.findByUsuarioIdAndLivroId(usuario.getId(), livroId)
                .orElseGet(() -> nova(usuario, livro));

        estante.setStatus(requisicao.status());
        estante.setFavorito(requisicao.favorito());
        estante.setTotalPaginas(livro.getTotalPaginas() == null ? requisicao.totalPaginas() : null);
        estante.setPaginaAtual(paginaValida(estante, requisicao));

        return paraDTO(estanteRepository.save(estante));
    }

    @Transactional(readOnly = true)
    public Optional<EstanteRespostaDTO> minhaVaga(Long livroId, String email) {
        Long usuarioId = usuarioService.buscarPorEmail(email).getId();
        return estanteRepository.findByUsuarioIdAndLivroId(usuarioId, livroId).map(this::paraDTO);
    }

    @Transactional
    public void remover(Long livroId, String email) {
        Long usuarioId = usuarioService.buscarPorEmail(email).getId();
        Estante estante = estanteRepository.findByUsuarioIdAndLivroId(usuarioId, livroId)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Este livro não está na sua estante"));
        estanteRepository.delete(estante);
    }

    // Listagem por Status, por Favoritos ou Tudo
    @Transactional(readOnly = true)
    public RespostaPaginadaDTO<EstanteRespostaDTO> listar(String email, StatusLeitura status,
            boolean somenteFavoritos, Pageable paginacao) {
        Long usuarioId = usuarioService.buscarPorEmail(email).getId();

        Page<Estante> pagina;
        if (somenteFavoritos) {
            pagina = estanteRepository.findByUsuarioIdAndFavoritoTrue(usuarioId, paginacao);
        } else if (status != null) {
            pagina = estanteRepository.findByUsuarioIdAndStatus(usuarioId, status, paginacao);
        } else {
            pagina = estanteRepository.findByUsuarioId(usuarioId, paginacao);
        }

        return RespostaPaginadaDTO.de(pagina.map(this::paraDTO));
    }

    // Contadores por Status e Paginometro
    @Transactional(readOnly = true)
    public ResumoEstanteDTO resumo(String email) {
        Long usuarioId = usuarioService.buscarPorEmail(email).getId();

        Map<StatusLeitura, Long> porStatus = new HashMap<>();
        for (Object[] linha : estanteRepository.contarPorStatus(usuarioId)) {
            porStatus.put((StatusLeitura) linha[0], ((Number) linha[1]).longValue());
        }

        long total = porStatus.values().stream().mapToLong(Long::longValue).sum();

        return new ResumoEstanteDTO(
                porStatus.getOrDefault(StatusLeitura.QUERO_LER, 0L),
                porStatus.getOrDefault(StatusLeitura.LENDO, 0L),
                porStatus.getOrDefault(StatusLeitura.LIDO, 0L),
                porStatus.getOrDefault(StatusLeitura.ABANDONADO, 0L),
                estanteRepository.countByUsuarioIdAndFavoritoTrue(usuarioId),
                total,
                estanteRepository.somarPaginasLidas(usuarioId));
    }

    // Consulta em Lote para as Fitas da Grade de Livros
    @Transactional(readOnly = true)
    public Map<Long, Estante> porLivros(String email, List<Long> livroIds) {
        if (livroIds.isEmpty()) {
            return Map.of();
        }
        Long usuarioId = usuarioService.buscarPorEmail(email).getId();
        Map<Long, Estante> mapa = new HashMap<>();
        for (Estante estante : estanteRepository.findByUsuarioIdAndLivroIdIn(usuarioId, livroIds)) {
            mapa.put(estante.getLivro().getId(), estante);
        }
        return mapa;
    }

    private Estante nova(Usuario usuario, Livro livro) {
        Estante estante = new Estante();
        estante.setUsuario(usuario);
        estante.setLivro(livro);
        return estante;
    }

    // Progresso So Faz Sentido em Leitura e Nunca Passa do Total
    private Integer paginaValida(Estante estante, EstanteRequestDTO requisicao) {
        if (requisicao.status() != StatusLeitura.LENDO || requisicao.paginaAtual() == null) {
            return null;
        }

        Integer total = estante.totalDePaginas();
        if (total != null && requisicao.paginaAtual() > total) {
            throw new RegraDeNegocioException(
                    "A página atual não pode ser maior que o total de %d páginas".formatted(total));
        }
        return requisicao.paginaAtual();
    }

    private Livro obterLivro(Long livroId) {
        return livroRepository.findById(livroId)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Livro não encontrado: id " + livroId));
    }

    private EstanteRespostaDTO paraDTO(Estante estante) {
        return new EstanteRespostaDTO(
                estante.getId(),
                livroMapper.paraResumo(estante.getLivro()),
                estante.getStatus(),
                estante.isFavorito(),
                estante.getPaginaAtual(),
                estante.totalDePaginas(),
                percentual(estante),
                estante.getAtualizadoEm());
    }

    private Integer percentual(Estante estante) {
        Integer total = estante.totalDePaginas();
        if (estante.getStatus() == StatusLeitura.LIDO) {
            return 100;
        }
        if (total == null || total == 0 || estante.getPaginaAtual() == null) {
            return null;
        }
        return (int) Math.round(estante.getPaginaAtual() * 100.0 / total);
    }
}
