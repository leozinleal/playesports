import { supabase } from './supabaseClient'
import { cpfValido, soDigitos } from './utils'

// Cria a conta (cliente ou dono). O perfil e o CPF são gravados pelo banco (trigger).
// Retorna { erro } ou { precisaConfirmar, email }.
export async function criarConta({ nome, email, telefone, cpf, senha, tipo }) {
  const c = soDigitos(cpf), t = soDigitos(telefone)
  if (!nome.trim()) return { erro: 'Digite seu nome completo.' }
  if (!cpfValido(c)) return { erro: 'CPF inválido. Confira os números.' }
  if (t.length < 10 || t.length > 11) return { erro: 'Digite o telefone com DDD, ex.: (51) 99999-9999.' }

  const { data: disp } = await supabase.rpc('cadastro_disponivel', { p_cpf: c, p_tel: t })
  if (disp === 'cpf') return { erro: 'Este CPF já tem cadastro.' }
  if (disp === 'telefone') return { erro: 'Este telefone já está em uso por outra conta.' }

  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: {
      emailRedirectTo: window.location.origin + (tipo === 'dono' ? '/dono' : '/'),
      data: { nome: nome.trim(), telefone: t, cpf: c, tipo },
    },
  })
  if (error) {
    if (/already|registered/i.test(error.message)) return { erro: 'Este e-mail já tem cadastro. Use "Entrar".' }
    if (/rate limit|too many/i.test(error.message)) return { erro: 'Muitas tentativas. Aguarde alguns minutos e tente de novo.' }
    if (/database error/i.test(error.message)) return { erro: 'Não foi possível concluir: confira os dados (CPF ou telefone podem já estar em uso).' }
    return { erro: 'Não foi possível criar a conta: ' + error.message }
  }
  // com confirmação de e-mail ligada, um e-mail já existente volta sem identidades
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return { erro: 'Este e-mail já tem cadastro. Use "Entrar".' }
  }
  return { precisaConfirmar: !data.session, email }
}