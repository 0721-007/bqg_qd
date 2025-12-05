export async function decodeTxtFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      try {
        const buffer = reader.result as ArrayBuffer
        const bytes = new Uint8Array(buffer)

        // 先按 UTF-8 解码
        const utf8Decoder = new TextDecoder('utf-8', { fatal: false })
        let text = utf8Decoder.decode(bytes)

        const replacementCount = (text.match(/\uFFFD/g) || []).length
        const length = text.length || 1

        // 如果疑似乱码（替换字符太多），尝试按 GBK 再解一次
        if (replacementCount > length * 0.01) {
          try {
            // 部分浏览器支持 'gbk' 标签，这里用 any 绕过 TS 类型限制
            const gbkDecoder = new TextDecoder('gbk' as any, { fatal: false })
            const gbkText = gbkDecoder.decode(bytes)
            const gbkReplacementCount = (gbkText.match(/\uFFFD/g) || []).length
            if (gbkReplacementCount < replacementCount) {
              text = gbkText
            }
          } catch {
            // 浏览器不支持 GBK 就退回 UTF-8 结果
          }
        }

        resolve(text)
      } catch (err) {
        reject(err)
      }
    }

    reader.onerror = () => {
      reject(reader.error || new Error('读取文件失败'))
    }

    reader.readAsArrayBuffer(file)
  })
}
