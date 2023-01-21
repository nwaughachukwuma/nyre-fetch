# Nyre-Fetch

Nyre-Fetch is a simple Node.js wrapper built on top of node-fetch. It includes helper methods I find helpful and use in my projects.

## Installation

```bash
npm install nyre-fetch
```

## Usage

```js
import nyreFetch from "nyre-fetch";

nyreFetch
  .get("https://example.com")
  .then((res) => res.json())
  .then((json) => console.log(json));
```

## License

[MIT](https://choosealicense.com/licenses/mit/)
