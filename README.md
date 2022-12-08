# easyts

js library written with ts

[中文](README.zh.md)

I am deeply poisoned by dart and golang. There are some interesting things in
dart and golang that can greatly simplify programming. However, when writing js,
I can't use these because there is no library to provide support. In addition,
js is usually used for front-end code. Some features in golang are estimated
that js will never support. But I have been inseparable from the working mode of
golang, so I wrote this library.

The original and core content of this library is to implement golang's chan and
select, and occasionally add some other various tool functions for various
interesting things

- [Install](#Install)
- [Quick start](#Quick-start)
  - [buffered](#buffered)
  - [close And for range](#close-And-for-range)
  - [select](#select)
  - [default](#default)
  - [bench](#bench)
- [api](https://powerpuffpenguin.github.io/ts/easyts/)
- [module](#module)
  - [core](#core)
  - [container](#container)
  - [sync](#sync)
  - [time](#time)
- [Deno](deno.md)

# Install

First you can install the library using npm

```
npm install @king011/easyts
```

This library is packaged with multiple target versions in the installation
directory. You can choose the version to import according to your environment.

- lib/es5
- lib/es6
- lib/es2022

If you use deno, you can create a deps.ts

```
export * from "https://deno.land/x/easyts/mod.ts";
export * from "https://deno.land/x/easyts/context/mod.ts";
// export from other.ts
```

# Quick start

I believe there is no need to explain how useful chan and select are, otherwise
we would not be looking for ways to use it in js together. If there is something
unclear about its concepts and points of attention, please check the
introduction of golang. The usage logic of this library is similar to that of
golang.

Just look at how the code creates chan and passes data:
[(golang)](https://go.dev/tour/concurrency/2)

```
import { Chan, WriteChannel } from "@king011/easyts/lib/es2022/channel"

function sum(s: Array<number>, c: WriteChannel<number>) {
    let sum = 0
    for (const v of s) {
        sum += v
    }
    c.write(sum) // send sum to c
}
async function main() {
    const s = [7, 2, 8, -9, 4, 0]
    const c = new Chan<number>()
    sum(s.slice(0, s.length / 2), c)
    sum(s.slice(s.length / 2), c)

    const [x, y] = [await c.read(), await c.read()] // receive from c

    // This is slightly different from golang. Golang grammatically supports two ways of receiving values. The way of receiving two return values is used to determine whether chan is closed.
    // As a js library, if you want to receive two values you need to use 'readRaw' instead of calling 'read'
    console.log(x, y, x! + y!)
}
main()
```

## buffered

A buffered chan can be used by passing a buffer length to the chan constructor:
[(golang)](https://go.dev/tour/concurrency/3)

```
import { Chan } from "@king011/easyts/lib/es2022/channel"

function main() {
    const ch = new Chan<number>(2)
    ch.write(1)
    ch.write(2)
    let v = ch.read()
    console.log(v)
    v = ch.read()
    console.log(v)
}
main()
```

## close And for range

The sender can use close to notify the receiver to close the channel, for await
will keep reading data from the async iterator until chan is closed:
[(golang)](https://go.dev/tour/concurrency/4)

```
import { Chan, WriteChannel } from "@king011/easyts/lib/es2022/channel"

async function fibonacci(n: number, c: WriteChannel<number>) {
    let x = 0, y = 1
    for (let i = 0; i < n; i++) {
        await c.write(x);
        [x, y] = [y, x + y]
    }
    c.close()
}

async function main() {
    const c = new Chan<number>(10)
    fibonacci(c.capacity, c)

    for await (const i of c) {
        console.log(i)
    }
}
main()
```

## select

You can use selectChan function to wait for multiple chan:
[(golang)](https://go.dev/tour/concurrency/5)

```
import { Chan, WriteChannel, ReadChannel, selectChan } from "@king011/easyts/lib/es2022/channel"

async function fibonacci(c: WriteChannel<number>, quit: ReadChannel<void>) {
    let x = 0, y = 1
    while (true) {
        // Create a write case
        const wc = c.writeCase(x)
        // Create a read case
        const qc = quit.readCase()

        // select will block until a case is processed, then return this case
        switch (await selectChan(wc, qc)) {
            case wc:
                [x, y] = [y, x + y]
                break
            case qc:
                // The readRaw function of the case will return the read value, like golang `val,ok = <- chan`
                {
                    const [, hasValue] = qc.readRaw()
                    console.log('quit', `ok=${hasValue}`)
                }
                return
        }
    }
}
async function main() {
    const c = new Chan<number>()
    const quit = new Chan<void>();
    (async () => {
        for (let i = 0; i < 10; i++) {
            console.log((await c.read()))
        }
        quit.close()
    })()
    fibonacci(c, quit)
}
main()
```

## default

By passing **0** to the selectChan function, the default logic can be executed
when no chan is ready. At this point selectChan will return **0**:
[(golang)](https://go.dev/tour/concurrency/6)

```
const c = ch.readCase()
// Because 0 exists, it is impossible to block so there is no need for await
switch (selectChan(0, c)) {
    case c:
        // use c.read() to get the read value
        break
    case 0:
        // receiving from c would block
        break
}
```

Here is a concrete example:

```
import { Chan, WriteChannel, ReadChannel, selectChan } from "@king011/easyts/lib/es2022/channel"

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}
function makeTick(ms: number): ReadChannel<Date> {
    const ch = new Chan<Date>();
    (async () => {
        while (true) {
            await sleep(ms)
            await ch.write(new Date())
        }
    })()
    return ch
}
function makeAfter(ms: number): ReadChannel<Date> {
    const ch = new Chan<Date>()
    sleep(ms).then(() => {
        ch.write(new Date())
    })
    return ch
}
async function main() {
    const tick = makeTick(100)
    const boom = makeAfter(500)
    while (true) {
        const cc = tick.readCase()
        const bc = boom.readCase()
        switch (selectChan(0, cc, bc)) {
            case cc:
                console.log('tick.')
                break
            case bc:
                console.log('BOOM!')
                return
            default: // case 0:
                console.log('    .')
                await sleep(50)
                break
        }
    }
}
main()
```

## bench

The following is a performance test under a generative consumption model
(consumers are fixed at 200)
[code](https://github.com/powerpuffpenguin/easyts/blob/main/src/core/channel_bench_test.ts)

| easyts on node-v14.15.3 es2022 | easyts on deno-1.28.3 | golang 1.18 GOMAXPROCS(12) | golang 1.18 GOMAXPROCS(1) | producer count | producer write | total write |
| ------------------------------ | --------------------- | -------------------------- | ------------------------- | -------------- | -------------- | ----------- |
| 21ms                           | 13ms                  | 3.418932ms                 | 3.090608ms                | 100            | 100            | 10000       |
| 105ms                          | 52ms                  | 31.774022ms                | 13.509742ms               | 100            | 1000           | 100000      |
| 966ms                          | 474ms                 | 339.338306ms               | 134.449078ms              | 1000           | 1000           | 1000000     |
| 4.725s                         | 2.366s                | 1.67669658s                | 659.809691ms              | 1000           | 5000           | 5000000     |
| 9.573s                         | 4.604s                | 3.376229048s               | 1.305668965s              | 1000           | 10000          | 10000000    |
