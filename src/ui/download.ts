const extToType = {
  "json": "application/json",
  "txt": "text/plain",
  "md": "text/markdown",
}

export function downloadText(text: string, fileName: string, ext: string = "txt") {
  const blob = new Blob([text], { type: extToType[ext] })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `${fileName}.${ext}`
  document.body.append(link)
  link.click()

  URL.revokeObjectURL(url)
  link.remove()
}