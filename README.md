# metadata

Pull metadata from a webpage through a crude heuristic that leverages regular HTML metadata, OpenGraph, JSON+LD data, and more.

```sh
npm i -s @bobheadxi/metadata
```

```ts
import { parseMeta } from '@bobheadxi/metadata';

export async function getMeta() {
    const resp = await fetch('https://bobheadxi.dev');
    const doc = new DOMParser().parseFromString(await resp.text(), 'text/html');
    return parseMeta(doc);
}
```

## about

`@bobheadxi/metadata` is a minimal-dependency library for pulling metadata from a given webpage.
What seems to be the de facto standard for doing so, [`metascraper`](https://github.com/microlinkhq/metascraper), is so elaborate that [there appears to be no intention for supporting browser environments](https://github.com/microlinkhq/metascraper/issues/61#issuecomment-363019772), and much to my suprise I was unable to find a semi-robust library that would work in browsers. So I hacked this together.
