generateDefer(20)
function generateDefer(count, tag) {
    for (let i = 0; i <= count; i++) {
        if (i == 0) {
            console.log('defer(f: () => any | Promise<any>): Cancel;')
            continue
        }
        let str = `defer<`
        let strs = []
        for (let j = 1; j <= i; j++) {
            strs.push(`T${j}`)
        }
        str += `${strs.join(', ')}>(f: (`
        strs = []
        for (let j = 1; j <= i; j++) {
            strs.push(`v${j}: T${j}`)
        }
        str += `${strs.join(', ')}) => `

        strs = ['any | Promise<any>']
        for (let j = 1; j <= i; j++) {
            strs.push(`v${j}: T${j}`)
        }

        str += `${strs.join(', ')}): Cancel;`

        console.log(str)
    }
}