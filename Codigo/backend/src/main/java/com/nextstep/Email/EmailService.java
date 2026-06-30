package com.nextstep.Email;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${nextstep.email.diretora}")
    private String emailDiretora;

    @Value("${spring.mail.username}")
    private String emailRemetente;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void enviarCodigoValidacaoProfessor(
            String nomeProfessor,
            String emailProfessor,
            String codigo
    ) throws MessagingException {

        System.out.println("=== ENVIANDO EMAIL DE VALIDACAO ===");
        System.out.println("Email remetente: " + emailRemetente);
        System.out.println("Email diretora: " + emailDiretora);
        System.out.println("Professor: " + nomeProfessor);
        System.out.println("Email professor: " + emailProfessor);
        System.out.println("Codigo: " + codigo);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(emailRemetente);
            helper.setTo(emailDiretora);
            helper.setSubject("NextStep — Novo cadastro de professor aguarda validação");

            String html = """
                    <!DOCTYPE html>
                    <html lang="pt-BR">
                    <head><meta charset="UTF-8"></head>
                    <body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
                      <table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:40px 0;">
                        <tr>
                          <td align="center">
                            <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

                              <tr>
                                <td style="background:linear-gradient(135deg,#1a73e8 0%%,#0d47a1 100%%);padding:36px 40px;text-align:center;">
                                  <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.5px;">NextStep</h1>
                                  <p style="margin:6px 0 0;color:#bbdefb;font-size:13px;letter-spacing:1px;text-transform:uppercase;">Plataforma Educacional</p>
                                </td>
                              </tr>

                              <tr>
                                <td style="padding:40px 40px 32px;">
                                  <p style="margin:0 0 8px;color:#5f6368;font-size:13px;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;">Solicitação de cadastro</p>
                                  <h2 style="margin:0 0 24px;color:#1a1a2e;font-size:22px;font-weight:700;">Um novo professor solicitou acesso</h2>

                                  <p style="margin:0 0 24px;color:#3c4043;font-size:15px;line-height:1.7;">
                                    Uma solicitação de cadastro foi recebida pelo sistema. Consulte os dados abaixo e utilize o código de validação para ativar a conta.
                                  </p>

                                  <table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f8f9fa;border-radius:8px;border:1px solid #e8eaed;margin-bottom:28px;">
                                    <tr>
                                      <td style="padding:20px 24px;">
                                        <table width="100%%" cellpadding="0" cellspacing="0">
                                          <tr>
                                            <td style="padding:6px 0;">
                                              <span style="color:#5f6368;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.6px;">Nome</span><br>
                                              <span style="color:#1a1a2e;font-size:16px;font-weight:600;">%s</span>
                                            </td>
                                          </tr>
                                          <tr>
                                            <td style="padding:6px 0;border-top:1px solid #e8eaed;">
                                              <span style="color:#5f6368;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.6px;">E-mail</span><br>
                                              <span style="color:#1a73e8;font-size:15px;">%s</span>
                                            </td>
                                          </tr>
                                        </table>
                                      </td>
                                    </tr>
                                  </table>

                                  <p style="margin:0 0 12px;color:#3c4043;font-size:14px;font-weight:600;">Código de validação:</p>
                                  <table width="100%%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                                    <tr>
                                      <td align="center" style="background:linear-gradient(135deg,#e3f2fd 0%%,#bbdefb 100%%);border:2px solid #1a73e8;border-radius:12px;padding:24px 20px;">
                                        <span style="font-size:42px;font-weight:800;letter-spacing:12px;color:#0d47a1;font-family:'Courier New',monospace;">%s</span>
                                      </td>
                                    </tr>
                                  </table>

                                  <p style="margin:0;color:#80868b;font-size:13px;line-height:1.6;">
                                    Este código expira em <strong>15 minutos</strong>. Após esse prazo, o professor deverá solicitar um novo código.
                                  </p>
                                </td>
                              </tr>

                              <tr>
                                <td style="background-color:#f8f9fa;border-top:1px solid #e8eaed;padding:20px 40px;text-align:center;">
                                  <p style="margin:0;color:#9aa0a6;font-size:12px;">
                                    Este e-mail foi gerado automaticamente pelo sistema NextStep. Não responda a esta mensagem.
                                  </p>
                                </td>
                              </tr>

                            </table>
                          </td>
                        </tr>
                      </table>
                    </body>
                    </html>
                    """.formatted(nomeProfessor, emailProfessor, codigo);

            helper.setText(html, true);

            System.out.println("=== CHAMANDO mailSender.send ===");
            mailSender.send(message);
            System.out.println("=== EMAIL ENVIADO COM SUCESSO ===");

        } catch (Exception e) {
            System.err.println("=== ERRO AO ENVIAR EMAIL DE VALIDACAO ===");
            e.printStackTrace();
            throw e;
        }
    }
}