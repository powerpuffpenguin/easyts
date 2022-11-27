const fs = require("fs/promises")
async function copyFile(dst, src) {
    let text = await fs.readFile(src, {
        encoding: 'utf8'
    })
    text = text.replace(/from[  ]+\'((\.{1,2}\/)+[a-zA-Z0-9\/_]+)\'/g, "from '$1.ts'")
    text = text.replace(/from[  ]+\"((\.{1,2}\/)+[a-zA-Z0-9\/_]+)\"/g, "from '$1.ts'")
    await fs.writeFile(dst, text)
}
async function copyDir(dst, src) {
    await fs.mkdir(dst, 0o775)
    const files = await fs.readdir(src)
    for (const file of files) {
        if (file.endsWith('.js')) {
            continue
        }
        if (file.endsWith('test.ts')) {
            continue
        } else if (file.endsWith('.ts')) {
            await copyFile(dst + '/' + file, src + '/' + file)
        } else {
            await copyDir(dst + '/' + file, src + '/' + file)
        }
    }
}
async function main() {
    let dst = __dirname + '/deno'
    try {
        await fs.rm(dst, {
            recursive: true,
        })
    } catch (_) { }
    const src = __dirname + '/src'
    await copyDir(dst, src)

    await fs.mkdir(dst + '/.vscode')
    await fs.writeFile(dst + '/.vscode/settings.json', JSON.stringify({
        "deno.enable": true
    }, undefined, '   '))
}
main()
