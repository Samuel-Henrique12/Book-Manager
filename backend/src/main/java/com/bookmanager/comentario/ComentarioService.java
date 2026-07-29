package com.bookmanager.comentario;

import com.bookmanager.comentario.dto.ComentarioRequestDTO;
import com.bookmanager.comentario.dto.ComentarioRespostaDTO;
import com.bookmanager.comum.excecao.RecursoNaoEncontradoException;
import com.bookmanager.comum.paginacao.RespostaPaginadaDTO;
import com.bookmanager.livro.Livro;
import com.bookmanager.livro.LivroRepository;
import com.bookmanager.usuario.Perfil;
import com.bookmanager.usuario.Usuario;
import com.bookmanager.usuario.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// Service de Comentarios
@Service
@RequiredArgsConstructor
public class ComentarioService {

    private final ComentarioRepository comentarioRepository;
    private final LivroRepository livroRepository;
    private final UsuarioService usuarioService;

    @Transactional(readOnly = true)
    public RespostaPaginadaDTO<ComentarioRespostaDTO> listar(Long livroId, String email,
            Pageable paginacao) {
        Long usuarioId = usuarioService.buscarPorEmail(email).getId();
        return RespostaPaginadaDTO.de(comentarioRepository.findByLivroId(livroId, paginacao)
                .map(comentario -> paraDTO(comentario, usuarioId)));
    }

    @Transactional
    public ComentarioRespostaDTO publicar(Long livroId, String email,
            ComentarioRequestDTO requisicao) {
        Usuario usuario = usuarioService.buscarPorEmail(email);
        Livro livro = livroRepository.findById(livroId)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Livro não encontrado: id " + livroId));

        Comentario comentario = new Comentario();
        comentario.setUsuario(usuario);
        comentario.setLivro(livro);
        comentario.setTexto(requisicao.texto().trim());

        return paraDTO(comentarioRepository.save(comentario), usuario.getId());
    }

    // O Autor Apaga o Proprio Comentario; o Admin Apaga Qualquer Um
    @Transactional
    public void remover(Long comentarioId, String email) {
        Usuario usuario = usuarioService.buscarPorEmail(email);
        Comentario comentario = obter(comentarioId);

        boolean autor = comentario.getUsuario().getId().equals(usuario.getId());
        if (!autor && usuario.getPerfil() != Perfil.ADMIN) {
            throw new AccessDeniedException("Você só pode remover os próprios comentários");
        }

        comentarioRepository.delete(comentario);
    }

    // Marcacao de Spoiler e Moderacao: Exclusiva do Admin
    @Transactional
    public ComentarioRespostaDTO marcarSpoiler(Long comentarioId, boolean spoiler, String email) {
        Usuario usuario = usuarioService.buscarPorEmail(email);
        Comentario comentario = obter(comentarioId);
        comentario.setSpoiler(spoiler);
        return paraDTO(comentarioRepository.save(comentario), usuario.getId());
    }

    private Comentario obter(Long comentarioId) {
        return comentarioRepository.findById(comentarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Comentário não encontrado: id " + comentarioId));
    }

    private ComentarioRespostaDTO paraDTO(Comentario comentario, Long usuarioAtualId) {
        return new ComentarioRespostaDTO(
                comentario.getId(),
                comentario.getUsuario().getNome(),
                comentario.getTexto(),
                comentario.isSpoiler(),
                comentario.getUsuario().getId().equals(usuarioAtualId),
                comentario.getCriadoEm());
    }
}
