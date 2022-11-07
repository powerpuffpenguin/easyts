# easyts
js library written with ts

[English](README.md)

本喵深受 dart 和 golang 的荼毒，dart 和 golang 裏面有一些很有趣的東西可以極大的簡化編程，然而在寫 js 時無法使用這些因爲沒有庫去提供支持。另外 js 通常用於前端代碼一些 golang 裏面的特性估計等到天荒地老 js 也不會支持，但本喵中毒太深已經離不開golang 的工作模式於是寫了這個庫。

本庫最初和核心內容是要實現 golang 的 chan 和 select ，此外也會偶爾增加一些其它各種工具函數用於各種趣事

* [安裝](#安裝)
* [快速開始](#快速開始)
    * [緩衝](#緩衝)
    * [關閉 和 for range](#關閉-和-for-range)
    * [select](#select)
    * [default](#default)
    * [bench](#bench)
* [api](https://powerpuffpenguin.github.io/ts/easyts/)

# 安裝

首先你可以使用 npm 安裝本庫

```
npm install @king011/easyts
```

本庫在安裝目錄下分別打包了多個目標版本，你可以依據自己的環境選擇要 import 的版本

* lib/es5
* lib/es6
* lib/es2022

# 快速開始

chan 和 select 有多好用相信不用解釋，不然我們也不會一起尋找在js中使用它的方法。如果對其概念和注意點有不清除的地方，請去查詢 golang 的相關介紹，本庫的使用方法邏輯都和 golang 類似。

直接來看代碼如何創建 chan 和傳遞 數據: [(golang)](https://go.dev/tour/concurrency/2)

```
import { Chan, WriteChannel } from "@king011/easyts/lib/es2022/core/channel"

function sum(s: Array<number>, c: WriteChannel<number>) {
    let sum = 0
    for (const v of s) {
        sum += v
    }
    c.write(sum) // 將和送入 c
}
async function main() {
    const s = [7, 2, 8, -9, 4, 0]
    const c = new Chan<number>()
    sum(s.slice(0, s.length / 2), c)
    sum(s.slice(s.length / 2), c)

    const [x, y] = [await c.read(), await c.read()] // 從 c 中接收

    // 這裏和 golang 稍有點差別，golang 從語法上支持了兩種接收值的方式，其中 接收兩個返回值的方式用於 判斷 chan 是否關閉
    // 作爲 js 庫，無法提供語法上的便利，爲了功能的完整採用了返回 IteratorResult 的方式來獲取值
    console.log(x.value, y.value, x.value + y.value)
}
main()
```

## 緩衝
爲 chan 構造函數傳入緩衝長度即可使用帶緩衝的 chan: [(golang)](https://go.dev/tour/concurrency/3)

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

## 關閉 和 for range
發送者可以使用 close 來通知接受者關閉通道, for await 會從異步迭代器中持續讀取數據直到 chan 被關閉: [(golang)](https://go.dev/tour/concurrency/4)

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

你可以使用 selectChan 函數等待多個 chan: [(golang)](https://go.dev/tour/concurrency/5)

```
import { selectChan } from "@king011/easyts"
import { Chan, WriteChannel, ReadChannel } from "@king011/easyts/lib/es2022/core/channel"

async function fibonacci(c: WriteChannel<number>, quit: ReadChannel<void>) {
    let x = 0, y = 1
    while (true) {
        // 創建一個 寫入 case
        const wc = c.writeCase(x)
        // 創建一個 讀取 case
        const qc = quit.readCase()

        // select 會阻塞直到 某個 case 被處理，就返回此 case
        switch (await selectChan(wc, qc)) {
            case wc:
                [x, y] = [y, x + y]
                break
            case qc:
                // case 的 read 函數會返回讀取到的值，它是一個 IteratorResult<T>
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

通過將 undefined 傳入 selectChan 函數，可以在沒有 chan 準備好時，執行 default 邏輯。此時 selectChan 會 返回 undefined: [(golang)](https://go.dev/tour/concurrency/6)

```
const c = ch.readCase()
// 因爲 undefined 存在所以不可能阻塞故不需要 await
switch (selectChan(undefined, c)) {
    case c:
        // 使用 c.read().value 來獲取讀取到的值
        break
    case undefined:
        // 從 c 接收會阻塞
        break
}
```

下面是一個具體的示例：
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

在 0.0.6 之前的版本首要問題是解決功能完整性問題， chan 存在一個效能bug，當讀寫併發太高性能會嚴重下降，這是因爲我將併發的讀寫隨機排序後以然一個隨機的讀寫完成，排序佔用了大量cpu時間。在 0.0.6 版本我已經修復了這一問題，現在將爲併發產生一個隨機的數組索引來選取完成對象，當它完成後將其和讀寫數組最後一個元素交換位置後刪除。

下面是一個生成消費模型下的效能測試(消費者固定爲 200 個)

|   easyts  |   golang 1.18 GOMAXPROCS(12)  |   golang 1.18 GOMAXPROCS(1)  |   producer count    | producer write|   total write  |
|---|---|---|---|---|---|
|	21ms	|   3.418932ms    |	3.090608ms	|	100	|	100	|	10000	|
|	105ms	|    31.774022ms   |	13.509742ms	|	100	|	1000	|	100000	|
|	966ms	|	339.338306ms    |   134.449078ms	|	1000	|	1000	|	1000000	|
|	4.725s	|	1.67669658s    |   659.809691ms	|	1000	|	5000	|	5000000	|
|	9.573s	|	3.376229048s    |   1.305668965s	|	1000	|	10000	|	10000000	|

