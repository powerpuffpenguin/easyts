const vals = [
    {
        items: [
            [1, "Exception"]
        ]
    },
]

const id = new Map()
const nam = new Map()
for (const obj of vals) {
    const pkg = obj.pkg ?? ''
    for (const val of obj.items ?? []) {
        let found = id.get(val[0])
        if (found) {
            throw `id '${val[0]}' already exists: ${found} ${val[1]}`
        }
        found = nam.get(val[1])
        if (found) {
            throw `name '${val[1]}' already exists: ${found} ${val[0]}`
        }
        let name = val[2] ?? val[1]
        if (pkg != '') {
            name = `${name} from "${pkg}"`
        }

        id.set(val[0], val[1])
        nam.set(val[1], val[0])

        console.log(`export const Identity${val[1]} = { id: ${val[0]}, name: '${name}' }`)
    }
}