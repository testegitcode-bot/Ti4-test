import { API_BASE } from "@/services/api";

export async function salvarPontuacao(nomeJogo, pontuacao) {
  let alunoId = localStorage.getItem("alunoId") || localStorage.getItem("userId");

  const usuarioSalvo = localStorage.getItem("nextstep_user");

  if (!alunoId && usuarioSalvo) {
    try {
      const usuario = JSON.parse(usuarioSalvo);

      alunoId = usuario.id || usuario.alunoId || usuario.userId;
    } catch (erro) {
      console.error("Erro ao ler usuário do localStorage:", erro);
    }
  }

  if (!alunoId) {
    console.error("Aluno não encontrado no localStorage");
    return;
  }

  const resposta = await fetch(`${API_BASE}/ranking/salvar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      alunoId: Number(alunoId),
      nomeJogo,
      pontuacao
    })
  });

  if (!resposta.ok) {
    throw new Error("Erro ao salvar pontuação");
  }

  return resposta.json();
}