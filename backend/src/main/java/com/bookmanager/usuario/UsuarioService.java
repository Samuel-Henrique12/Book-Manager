package com.bookmanager.usuario;

import com.bookmanager.autenticacao.verificacao.TokenVerificacaoRepository;
import com.bookmanager.comum.excecao.RecursoNaoEncontradoException;
import com.bookmanager.comum.excecao.RegraDeNegocioException;
import com.bookmanager.comum.paginacao.RespostaPaginadaDTO;
import com.bookmanager.usuario.dto.AlterarPerfilRequestDTO;
import com.bookmanager.usuario.dto.AlterarSenhaRequestDTO;
import com.bookmanager.usuario.dto.AtualizarNomeRequestDTO;
import com.bookmanager.usuario.dto.ContaRespostaDTO;
import com.bookmanager.usuario.dto.UsuarioRespostaDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// Service de Usuarios
@Slf4j
@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final TokenVerificacaoRepository tokenRepository;
    private final UsuarioMapper usuarioMapper;
    private final PasswordEncoder codificadorDeSenha;

    // Buscar Usuario por Email ou Try Exception
    @Transactional(readOnly = true)
    public Usuario buscarPorEmail(String email) {
        return usuarioRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado: " + email));
    }

    // Buscar Usuario por ID ou Try Exception
    @Transactional(readOnly = true)
    public Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado: id " + id));
    }

    // Dados da Conta do Usuario Autenticado
    @Transactional(readOnly = true)
    public ContaRespostaDTO obterConta(String email) {
        return montarConta(buscarPorEmail(email));
    }

    // Alterar o Proprio Nome
    @Transactional
    public ContaRespostaDTO atualizarConta(String email, AtualizarNomeRequestDTO requisicao) {
        Usuario usuario = buscarPorEmail(email);
        usuario.setNome(requisicao.nome().trim());
        return montarConta(usuarioRepository.save(usuario));
    }

    // Alterar a Propria Senha Exigindo a Atual
    @Transactional
    public void alterarSenha(String email, AlterarSenhaRequestDTO requisicao) {
        Usuario usuario = buscarPorEmail(email);

        if (!codificadorDeSenha.matches(requisicao.senhaAtual(), usuario.getSenha())) {
            throw new RegraDeNegocioException("A senha atual está incorreta");
        }
        if (codificadorDeSenha.matches(requisicao.novaSenha(), usuario.getSenha())) {
            throw new RegraDeNegocioException("A nova senha deve ser diferente da anterior");
        }

        usuario.setSenha(codificadorDeSenha.encode(requisicao.novaSenha()));
        usuarioRepository.save(usuario);
        log.info("Senha alterada pelo próprio usuário: id {}", usuario.getId());
    }

    // Excluir a Propria Conta (Soft Delete)
    @Transactional
    public void excluirConta(String email) {
        remover(buscarPorEmail(email));
    }

    // Listar Usuarios com Filtro por Nome ou Email e Paginacao
    @Transactional(readOnly = true)
    public RespostaPaginadaDTO<UsuarioRespostaDTO> listar(String busca, Pageable paginacao) {
        Page<Usuario> pagina = (busca == null || busca.isBlank())
                ? usuarioRepository.findAll(paginacao)
                : usuarioRepository.findByNomeContainingIgnoreCaseOrEmailContainingIgnoreCase(
                        busca.trim(), busca.trim(), paginacao);
        return RespostaPaginadaDTO.de(pagina.map(usuarioMapper::paraResposta));
    }

    // Buscar Usuario por ID
    @Transactional(readOnly = true)
    public UsuarioRespostaDTO detalhar(Long id) {
        return usuarioMapper.paraResposta(buscarPorId(id));
    }

    // Alterar o Nome de Qualquer Usuario
    @Transactional
    public UsuarioRespostaDTO atualizarUsuario(Long id, AtualizarNomeRequestDTO requisicao) {
        Usuario usuario = buscarPorId(id);
        usuario.setNome(requisicao.nome().trim());
        return usuarioMapper.paraResposta(usuarioRepository.save(usuario));
    }

    // Trocar o Perfil de Acesso de Qualquer Usuario
    @Transactional
    public UsuarioRespostaDTO alterarPerfil(Long id, AlterarPerfilRequestDTO requisicao) {
        Usuario usuario = buscarPorId(id);

        if (usuario.getPerfil() != requisicao.perfil()) {
            garantirQueNaoEhUltimoAdmin(usuario);
            usuario.setPerfil(requisicao.perfil());
            log.info("Perfil do usuário {} alterado para {}", usuario.getId(), requisicao.perfil());
        }

        return usuarioMapper.paraResposta(usuarioRepository.save(usuario));
    }

    // Excluir Usuario pelo Painel Administrativo (Soft Delete)
    @Transactional
    public void removerUsuario(Long id, String emailSolicitante) {
        Usuario usuario = buscarPorId(id);

        if (usuario.getEmail().equalsIgnoreCase(emailSolicitante)) {
            throw new RegraDeNegocioException(
                    "Para excluir a própria conta, use a tela Minha conta");
        }

        remover(usuario);
    }

    // Invalida os Tokens Pendentes Antes do Soft Delete
    private void remover(Usuario usuario) {
        garantirQueNaoEhUltimoAdmin(usuario);
        tokenRepository.invalidarTodosDoUsuario(usuario);
        usuarioRepository.delete(usuario);
        log.info("Conta removida (soft delete): id {}", usuario.getId());
    }

    // Impede a Plataforma de Ficar sem Administrador
    private void garantirQueNaoEhUltimoAdmin(Usuario usuario) {
        if (usuario.getPerfil() == Perfil.ADMIN && usuarioRepository.countByPerfil(Perfil.ADMIN) <= 1) {
            throw new RegraDeNegocioException(
                    "Não é possível remover o último administrador da plataforma");
        }
    }

    private ContaRespostaDTO montarConta(Usuario usuario) {
        return usuarioMapper.paraConta(usuario, usuario.getPerfil() == Perfil.ADMIN);
    }
}
