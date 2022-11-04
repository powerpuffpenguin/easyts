# easyts
js library written with ts

[English](README.md)

本喵深受 dart 和 golang 的荼毒，dart 和 golang 裏面有一些很有趣的東西可以極大的簡化編程，然而在寫 js 時無法使用這些因爲沒有庫去提供支持。另外 js 通常用於前端代碼一些 golang 裏面的特性估計等到天荒地老 js 也不會支持，但本喵中毒太深已經離不開goalng 的工作模式於是寫了這個庫。

本庫最初和核心內容是要實現 golang 的 chan 和 select ，此外也會偶爾增加一些其它各種工具函數用於各種趣事

# 安裝

首先你可以使用 npm 安裝本庫

```
npm -i @king011/easyts
```

本庫在安裝目錄下分別打包了多個目標版本，你可以依據自己的環境選擇要 import 的版本

* lib/es5
* lib/es6
* lib/es2022

# 快速開始

chan 和 select 有多好用相信不用解釋，不然我們也不會一起尋找在js中使用它的方法。如果對其概念和注意點有不清除的地方，請去查詢 goalng 的相信介紹，本庫的使用方法邏輯都和 golang 類似。

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
    // 作爲 js 庫，無法提供語法上的變量，爲了功能的完整採用了返回 IteratorResult 的方式來獲取值
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

```