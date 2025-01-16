---
title: combine
description: 如何创建store并自动推断类型
nav: 201
---

# combine

`combine`中间件允许您通过将初始状态与添加新状态切片和操作的状态创建器函数合并来创建内聚状态。这非常有用，因为它会自动推断类型，因此不需要显式类型定义。

:::tip
这使得中间件使用不需要 `create` 和 `createStore` 的柯里化版本，从而使状态管理更加简单和高效。
:::

```js
const nextStateCreatorFn = combine(initialState, additionalStateCreatorFn)
```

## 类型

### 签名

```ts
combine<T, U>(initialState: T, additionalStateCreatorFn: StateCreator<T, [], [], U>): StateCreator<Omit<T, keyof U> & U, [], []>
```

## 语法

### `combine(initialState, additionalStateCreatorFn)`

#### 参数

- `initialState`: 您希望初始状态的值。它可以是任何类型的值，函数除外。
- `additionalStateCreatorFn`: 一个以 `set` 函数、`get` 函数和 `store` 作为参数的函数。通常，您将返回一个带有您想要公开的方法的对象。

#### 返回

`combine` 返回一个状态创建器函数。

## 使用

### 使用推断类型创建商店

此示例向您展示如何创建存储并自动推断类型，因此您无需显式定义它们。

```ts
import { createStore } from 'zustand/vanilla'
import { combine } from 'zustand/middleware'

const positionStore = createStore(
  combine({ position: { x: 0, y: 0 } }, (set) => ({
    setPosition: (position) => set({ position }),
  })),
)

const $dotContainer = document.getElementById('dot-container') as HTMLDivElement
const $dot = document.getElementById('dot') as HTMLDivElement

$dotContainer.addEventListener('pointermove', (event) => {
  positionStore.getState().setPosition({
    x: event.clientX,
    y: event.clientY,
  })
})

const render: Parameters<typeof positionStore.subscribe>[0] = (state) => {
  $dot.style.transform = `translate(${state.position.x}px, ${state.position.y}px)`
}

render(positionStore.getInitialState(), positionStore.getInitialState())

positionStore.subscribe(render)
```

这是`html`代码

```html
<div
  id="dot-container"
  style="position: relative; width: 100vw; height: 100vh;"
>
  <div
    id="dot"
    style="position: absolute; background-color: red; border-radius: 50%; left: -10px; top: -10px; width: 20px; height: 20px;"
  ></div>
</div>
```

## 故障排除

待定
