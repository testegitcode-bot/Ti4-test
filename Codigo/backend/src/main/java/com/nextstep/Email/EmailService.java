package com.nextstep.Email;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

@Service
public class EmailService {

    private final RestTemplate restTemplate;

    @Value("${BREVO_API_KEY}")
    private String brevoApiKey;

    @Value("${nextstep.email.diretora}")
    private String emailDiretora;

    public EmailService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public void enviarCodigoValidacaoProfessor(String nomeProfessor, String emailProfessor, String codigo) {
    String url = "https://api.brevo.com/v3/smtp/email";
    
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.set("api-key", brevoApiKey);

    // Usamos Text Blocks (três aspas) para o HTML ficar limpo e legível
    String htmlContent = """

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
                                    Este código expira em <strong>24 horas</strong>. Após esse prazo, o professor deverá solicitar um novo código.
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

    // Aqui está o truque para enviar via API:
    // Precisamos limpar o HTML (remover quebras de linha e escapar aspas)
    String cleanHtml = htmlContent.replace("\"", "\\\"").replace("\n", "").replace("\r", "");

    String body = String.format("""
        {
            "sender": {"name": "NextStep", "email": "nextstep.sistema@gmail.com"},
            "to": [{"email": "%s"}],
            "subject": "NextStep — Novo cadastro de professor",
            "htmlContent": "%s"
        }
        """, emailDiretora, cleanHtml);

    HttpEntity<String> entity = new HttpEntity<>(body, headers);
    
    try {
        restTemplate.postForEntity(url, entity, String.class);
        System.out.println("=== EMAIL ENVIADO COM SUCESSO ===");
    } catch (Exception e) {
        e.printStackTrace();
        throw e;
    }
}
}
