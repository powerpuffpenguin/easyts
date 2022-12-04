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
export * from "https://deno.land/x/easyts@0.0.20/core.ts";
export * from "https://deno.land/x/easyts@0.0.20/context.ts";
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
import { Chan, WriteChannel } from "@king011/easyts/lib/es2022/core/channel"

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
    // As a js library, it cannot provide syntactic convenience. In order to complete the function, the method of returning IteratorResult is adopted to obtain the value.
    console.log(x.value, y.value, x.value + y.value)
}
main()
```

## buffered

A buffered chan can be used by passing a buffer length to the chan constructor:
[(golang)](https://go.dev/tour/concurrency/3)

```
import { Chan } from "@king011/easyts/lib/es2022/core/channel"

function main() {
    const ch = new Chan<number>(2)
    ch.write(1)
    ch.write(2)
    let v = ch.read() as IteratorResult<number>
    console.log(v.value)
    v = ch.read() as IteratorResult<number>
    console.log(v.value)
}
main()
```

## close And for range

The sender can use close to notify the receiver to close the channel, for await
will keep reading data from the async iterator until chan is closed:
[(golang)](https://go.dev/tour/concurrency/4)

```
import { Chan, WriteChannel } from "@king011/easyts/lib/es2022/core/channel"

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
import { selectChan } from "@king011/easyts"
import { Chan, WriteChannel, ReadChannel } from "@king011/easyts/lib/es2022/core/channel"

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
                // The read function of the case will return the read value, which is an IteratorResult<T>
                console.log('quit', `done=${qc.read().done}`)
                return
        }
    }
}
async function main() {
    const c = new Chan<number>()
    const quit = new Chan<void>();
    (async () => {
        for (let i = 0; i < 10; i++) {
            console.log((await c.read())?.value)
        }
        quit.close()
    })()
    fibonacci(c, quit)
}
main()
```

## default

By passing undefined to the selectChan function, the default logic can be
executed when no chan is ready. At this point selectChan will return undefined:
[(golang)](https://go.dev/tour/concurrency/6)

```
const c = ch.readCase()
// Because undefined exists, it is impossible to block so there is no need for await
switch (selectChan(undefined, c)) {
    case c:
        // use c.read().value to get the read value
        break
    case undefined:
        // receiving from c would block
        break
}
```

Here is a concrete example:

```
import { Chan, WriteChannel, ReadChannel, selectChan } from "@king011/easyts/lib/es2022/core/channel"

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
        switch (selectChan(undefined, cc, bc)) {
            case cc:
                console.log('tick.')
                break
            case bc:
                console.log('BOOM!')
                return
            default: // case undefined:
                console.log('    .')
                await sleep(50)
                break
        }
    }
}
main()
```

## bench

The main problem of versions before 0.0.6 is to solve the problem of functional
integrity. There is a performance bug in chan. When the read and write
concurrency is too high, the performance will be seriously degraded. This is
because I randomly sequence the concurrent read and write, so that a random The
read and write are done, and the sorting takes up a lot of cpu time. In version
0.0.6 I have fixed this issue and will now generate a random array index for the
concurrency to pick the completion object and when it is done swap it with the
last element of the read/write array and delete it.

The following is a performance test under a generative consumption model
(consumers are fixed at 200)
[code](https://github.com/powerpuffpenguin/easyts/blob/main/src/core/channel_bench_test.ts)

| easyts on node-v14.15.3 | golang 1.18 GOMAXPROCS(12) | golang 1.18 GOMAXPROCS(1) | producer count | producer write | total write |
| ----------------------- | -------------------------- | ------------------------- | -------------- | -------------- | ----------- |
| 21ms                    | 3.418932ms                 | 3.090608ms                | 100            | 100            | 10000       |
| 105ms                   | 31.774022ms                | 13.509742ms               | 100            | 1000           | 100000      |
| 966ms                   | 339.338306ms               | 134.449078ms              | 1000           | 1000           | 1000000     |
| 4.725s                  | 1.67669658s                | 659.809691ms              | 1000           | 5000           | 5000000     |
| 9.573s                  | 3.376229048s               | 1.305668965s              | 1000           | 10000          | 10000000    |

# module

This library contains many modular components, you can import your own
requirements, the following is the index and function introduction of these
modules, you can find the modules you want to use here

## core

[core](https://powerpuffpenguin.github.io/ts/easyts/modules/core.html) is the
most important module, it mainly implements some functions that I expect js to
be able to provide but actually don't have. So I implemented them myself, using
the components here can more or less change the mode of writing code

core mainly contains the following contents

- A complete simulation of chan and select in golang language
- Mock support for defer in golang language
- Implemented a Slice template class with reference to golang
- A class Exception is defined to provide golang-like error recognition
- Implement a Completer for Promise with reference to dartlang's Completer
- Refer to c++ boost to implement a signals/slots

## container

[container](https://powerpuffpenguin.github.io/ts/easyts/modules/container.html)
is mainly some data containers. I wanted to implement it with reference to c++
std, but I found that the workload is too much and it is too difficult, and the
style is too inconsistent with js. After thinking about it, I asked myself is
the container/algorithm of c++ std really necessary? The answer is no. Usually,
the optimization algorithm that needs to consider performance needs to be
optimized for a specific container, so I rarely use the general algorithm
provided by std even in C++, but to call the algorithm version specialized for
the container itself. So in the end I only defined a few properties and methods
for the container interface that felt the most used.

container currently contains the following:

- List A doubly linked list implemented with reference to the golang standard
  library
- Heap A min/max heap implemented with reference to the golang standard library
- Queue A queue implemented as a fixed-length array

## context

[context](https://powerpuffpenguin.github.io/ts/easyts/modules/context.html)
completely simulate the context in the golang standard library, so that the code
can better work with chan select

## sync

[sync](https://powerpuffpenguin.github.io/ts/easyts/modules/sync.html)
implements some locks, and WaitGroup is used to wait for async to complete.
Their interface signatures all refer to golang, but the implementation is not
because js is single-threaded, so it is much easier to implement these than in
golang. Although single-threaded race conditions do not occur, locks are also
necessary if an operation involves multiple asynchronous processes at the same
time.

In addition, condition variable is currently not implemented, because js uses
very few locks, and the implementation of condition variable is a little
complicated. In fact, condition variable and chan are similar in nature, so you
should use chan instead of traditional condition variable.

## time

[time](https://powerpuffpenguin.github.io/ts/easyts/modules/time.html)
implements some timers with reference to golang's standard library. Although js
itself provides timers, they cannot be used well with chan and select.
