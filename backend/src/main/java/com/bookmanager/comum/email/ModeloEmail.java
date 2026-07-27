package com.bookmanager.comum.email;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

// Montagem do Conteudo dos E-mails
@Component
@RequiredArgsConstructor
public class ModeloEmail {

    private final PropriedadesEmail propriedades;

    public record Mensagem(String assunto, String html) {
    }

    public Mensagem confirmacaoDeConta(String nome, String token) {
        return new Mensagem(
                "Confirme seu e-mail — Book Manager",
                montar(nome,
                        "Confirme seu e-mail",
                        "Falta um passo para sua estante ficar pronta. Confirme que este e-mail é seu para ativar a conta.",
                        "Confirmar e-mail",
                        montarLink("/confirmar-email", token),
                        "O link vale por 24 horas. Se você não criou esta conta, é só ignorar esta mensagem."));
    }

    public Mensagem redefinicaoDeSenha(String nome, String token) {
        return new Mensagem(
                "Redefinição de senha — Book Manager",
                montar(nome,
                        "Redefinir sua senha",
                        "Recebemos um pedido para redefinir a senha da sua conta. Use o botão abaixo para escolher uma nova.",
                        "Redefinir senha",
                        montarLink("/redefinir-senha", token),
                        "O link vale por 1 hora. Se não foi você, ignore este e-mail — sua senha continua a mesma."));
    }

    private String montarLink(String caminho, String token) {
        String base = propriedades.urlBase().replaceAll("/+$", "");
        return base + caminho + "?token=" + URLEncoder.encode(token, StandardCharsets.UTF_8);
    }

    // Modelo HTML com a Identidade da Marca
    private String montar(String nome, String titulo, String texto, String rotuloBotao,
                          String link, String rodape) {
        return """
                <!doctype html>
                <html lang="pt-BR"><body style="margin:0;padding:0;background:#f7f4ef;">
                <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background:#f7f4ef;padding:32px 16px;">
                  <tr><td align="center">
                    <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid #ebe6dd;border-radius:16px;">
                      <tr><td style="padding:32px 32px 0;">
                        <span style="font:700 19px/1 -apple-system,Segoe UI,Roboto,sans-serif;color:#1b1a18;letter-spacing:-.02em;">
                          <span style="color:#d4521c;">&#9782;</span> Book Manager
                        </span>
                      </td></tr>
                      <tr><td style="padding:28px 32px 0;">
                        <h1 style="margin:0;font:500 27px/1.2 Georgia,serif;color:#1b1a18;">%s</h1>
                        <p style="margin:14px 0 0;font:400 15px/1.6 -apple-system,Segoe UI,Roboto,sans-serif;color:#46433e;">
                          Olá, %s. %s
                        </p>
                      </td></tr>
                      <tr><td style="padding:26px 32px 0;">
                        <a href="%s" style="display:inline-block;background:#d4521c;color:#ffffff;text-decoration:none;font:600 15px/1 -apple-system,Segoe UI,Roboto,sans-serif;padding:15px 26px;border-radius:12px;">%s</a>
                      </td></tr>
                      <tr><td style="padding:22px 32px 0;">
                        <p style="margin:0;font:400 12.5px/1.6 -apple-system,Segoe UI,Roboto,sans-serif;color:#78736b;">
                          Se o botão não funcionar, copie e cole este endereço no navegador:<br>
                          <span style="color:#d4521c;word-break:break-all;">%s</span>
                        </p>
                      </td></tr>
                      <tr><td style="padding:22px 32px 32px;">
                        <p style="margin:0;padding-top:18px;border-top:1px solid #ebe6dd;font:400 12.5px/1.6 -apple-system,Segoe UI,Roboto,sans-serif;color:#a39d93;">%s</p>
                      </td></tr>
                    </table>
                  </td></tr>
                </table>
                </body></html>
                """.formatted(titulo, nome, texto, link, rotuloBotao, link, rodape);
    }
}
