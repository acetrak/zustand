---
title: SSR和水合作用
nav: 16
---

## 服务器端渲染 (SSR)


服务器端渲染 (SSR) 是一种技术，可帮助我们在服务器上将组件渲染为 HTML 字符串，将它们直接发送到浏览器，最后将静态标记“水化”为客户端上的完全交互式应用程序。

### React

假设我们想使用 React 渲染一个无状态应用程序。为此，我们需要使用`express`、`react` 和`react-dom/server`。我们不需要`react-dom/client`，因为它是一个无状态应用程序。

让我们深入探讨一下：

- `express` 帮助我们构建一个可以使用 Node 运行的 Web 应用程序，
- `react` 帮助我们构建我们在应用程序中使用的 UI 组件，
- `react-dom/server` 帮助我们在服务器上渲染组件。

```json
// tsconfig.json
{
  "compilerOptions": {
    "noImplicitAny": false,
    "noEmitOnError": true,
    "removeComments": false,
    "sourceMap": true,
    "target": "esnext"
  },
  "include": ["**/*"]
}
```

:::warning
不要忘记删除 `tsconfig.json` 文件中的所有注释。
:::

```tsx
// app.tsx
export const App = () => {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Static Server-side-rendered App</title>
      </head>
      <body>
        <div>Hello World!</div>
      </body>
    </html>
  )
}
```

```tsx
// server.tsx
import express from 'express'
import React from 'react'
import ReactDOMServer from 'react-dom/server'

import { App } from './app.tsx'

const port = Number.parseInt(process.env.PORT || '3000', 10)
const app = express()

app.get('/', (_, res) => {
  const { pipe } = ReactDOMServer.renderToPipeableStream(<App />, {
    onShellReady() {
      res.setHeader('content-type', 'text/html')
      pipe(res)
    },
  })
})

app.listen(port, () => {
  console.log(`Server is listening at ${port}`)
})
```

```sh
tsc --build
```

```sh
node server.js
```

## Hydration

Hydration 将来自服务器的初始 HTML 快照转换为在浏览器中运行的完全交互式应用程序。 “水合”组件的正确方法是使用 `HydroRoot`。

### React

假设我们想使用 React 渲染一个有状态的应用程序。为此，我们需要使用`express`、`react`、`react-dom/server` 和`react-dom/client`。

让我们深入探讨一下：

- `express` 帮助我们构建一个可以使用 Node 运行的 Web 应用程序，
- `react` 帮助我们构建我们在应用程序中使用的 UI 组件，
- `react-dom/server` 帮助我们在服务器上渲染组件，
- `react-dom/client` 帮助我们在客户端上补充我们的组件。

:::warning
不要忘记，即使我们可以在服务器上渲染我们的组件，重要的是在客户端上“hydrate”它们以使它们具有交互性。
:::

```json
// tsconfig.json
{
  "compilerOptions": {
    "noImplicitAny": false,
    "noEmitOnError": true,
    "removeComments": false,
    "sourceMap": true,
    "target": "esnext"
  },
  "include": ["**/*"]
}
```

:::warning
不要忘记删除 `tsconfig.json` 文件中的所有注释。
:::

```tsx
// app.tsx
export const App = () => {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Static Server-side-rendered App</title>
      </head>
      <body>
        <div>Hello World!</div>
      </body>
    </html>
  )
}
```

```tsx
// main.tsx
import ReactDOMClient from 'react-dom/client'

import { App } from './app.tsx'

ReactDOMClient.hydrateRoot(document, <App />)
```

```tsx
// server.tsx
import express from 'express'
import React from 'react'
import ReactDOMServer from 'react-dom/server'

import { App } from './app.tsx'

const port = Number.parseInt(process.env.PORT || '3000', 10)
const app = express()

app.use('/', (_, res) => {
  const { pipe } = ReactDOMServer.renderToPipeableStream(<App />, {
    bootstrapScripts: ['/main.js'],
    onShellReady() {
      res.setHeader('content-type', 'text/html')
      pipe(res)
    },
  })
})

app.listen(port, () => {
  console.log(`Server is listening at ${port}`)
})
```

```sh
tsc --build
```

```sh
node server.js
```

:::warning
传递给 HydroRoot 的 React 树需要产生与服务器上相同的输出。导致水合错误的最常见原因包括：

- 根节点内 React 生成的 HTML 周围有额外的空格（如换行符）。
- 在渲染逻辑中使用像 `typeof window !== 'undefined'` 这样的检查。
- 在渲染逻辑中使用仅限浏览器的 API，例如 `window.matchMedia`。
- 在服务器和客户端上呈现不同的数据。

React 可以从一些水合错误中恢复，但您必须像其他错误一样修复它们。在最好的情况下，它们会导致经济放缓；在最坏的情况下，事件处理程序可能会附加到错误的元素。
:::

您可以在此处阅读有关警告和陷阱的更多信息： [hydrateRoot](https://react.dev/reference/react-dom/client/hydrateRoot)
