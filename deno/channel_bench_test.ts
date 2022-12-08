import { Chan, WriteChannel, ReadChannel } from './channel.ts'

class Wait {
    ch = new Chan<void>()
    wait = 0
    add(i: number) {
        this.wait += i
    }
    done() {
        this.wait--
        if (this.wait == 0) {
            this.ch.close()
        }
    }
}
async function producer(ch: WriteChannel<number>, count: number, w: Wait) {
    for (let i = 0; i < count; i++) {
        await ch.write(i)
    }
    w.done()
}
async function consume(ch: ReadChannel<number>, w: Wait) {
    for await (const v of ch) {
        // console.log(v)
    }
    w.done()
}
async function test(p: number, n: number) {
    const last = Date.now()

    const w = new Wait()
    const r = new Wait()
    const ch = new Chan<number>()
    for (let i = 0; i < 200; i++) {
        r.add(1)
        consume(ch, r)
    }

    for (let i = 0; i < p; i++) {
        w.add(1)
        producer(ch, n, w)
    }

    for await (const _ of w.ch) { }
    ch.close()
    for await (const _ of r.ch) { }

    const v = Date.now() - last
    const str = v >= 1000 ? `${v / 1000}s` : `${v}ms`
    console.log(`|	${str}	|	${p}	|	${n}	|	${p * n}	|`)
}
async function main() {
    await test(100, 100)
    await test(100, 1000)
    await test(1000, 1000)
    await test(1000, 5000)
    await test(1000, 10000)
}
main()