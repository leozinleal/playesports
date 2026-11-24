// Reduz a foto antes de enviar: no máximo 1600 px no maior lado, em JPG.
// Fica leve para carregar e não gasta o espaço grátis do Supabase.
export async function reduzirImagem(arquivo, maximo = 1600, qualidade = 0.82) {
  const bmp = await createImageBitmap(arquivo, { imageOrientation: 'from-image' })
  const escala = Math.min(1, maximo / Math.max(bmp.width, bmp.height))
  const w = Math.round(bmp.width * escala)
  const h = Math.round(bmp.height * escala)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  canvas.getContext('2d').drawImage(bmp, 0, 0, w, h)
  bmp.close?.()
  return new Promise((ok, falha) =>
    canvas.toBlob((b) => (b ? ok(b) : falha(new Error('Falha ao converter a foto'))), 'image/jpeg', qualidade))
}

// Caminho do arquivo dentro do bucket "quadras" (para apagar). Links de outros sites retornam null.
export function caminhoNoBucket(url) {
  const marca = '/object/public/quadras/'
  const i = url.indexOf(marca)
  return i === -1 ? null : decodeURIComponent(url.slice(i + marca.length))
}