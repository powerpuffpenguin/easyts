# Deno

Specify package alias in import_map.json

```
{
  "imports": {
    "easyts/":"https://raw.githubusercontent.com/powerpuffpenguin/easyts/0.0.16/deno/"
  }
}
```

or

```
{
  "imports": {
    "easyts/":"https://cdn.jsdelivr.net/gh/powerpuffpenguin/easyts@0.0.16/deno/"
  }
}
```

> Please modify package version to the version you want to use

Now you can use various functions provided in easyts

```
import { Chan } from "easyts/core.ts";
const c = new Chan<number>(1)

await c.write(-1);
(async () => {
    for (let i = 0; i < 5; i++) {
        await c.write(i)
    }
    c.close()
})()

for await (const v of c) {
    console.log(v)
}
```
