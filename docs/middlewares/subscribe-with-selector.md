---
title: subscribeWithSelector
description: 如何订阅store中的精细store更新
nav: 210
---

# subscribeWithSelector

`subscribeWithSelector` 中间件可让您根据当前状态订阅特定数据。

```js
const nextStateCreatorFn = subscribeWithSelector(stateCreatorFn)
```

## 类型

### 签名

```ts
subscribeWithSelector<T>(stateCreatorFn: StateCreator<T, [], []>): StateCreator<T, [['zustand/subscribeWithSelector', never]], []>
```

### 突变体

<!-- prettier-ignore-start -->
```ts
['zustand/subscribeWithSelector', never]
```
<!-- prettier-ignore-end -->

## 语法

### `subscribeWithSelector(stateCreatorFn)`

#### 参数

- `stateCreatorFn`: 一个以 `set` 函数、`get` 函数和 `store` 作为参数的函数。通常，您将返回一个带有您想要公开的方法的对象。

#### 返回

`subscribeWithSelector` 返回一个状态创建器函数。

## 用法

### 订阅部分状态更新

通过订阅部分状态更新，您可以注册一个回调，每当商店的部分状态更新时就会触发该回调。我们可以使用 `subscribe` 进行外部状态管理。

```ts
import { createStore } from 'zustand/vanilla'
import { subscribeWithSelector } from 'zustand/middleware'

type PositionStoreState = { position: { x: number; y: number } }

type PositionStoreActions = {
  setPosition: (nextPosition: PositionStoreState['position']) => void
}

type PositionStore = PositionStoreState & PositionStoreActions

const positionStore = createStore<PositionStore>()(
  subscribeWithSelector((set) => ({
    position: { x: 0, y: 0 },
    setPosition: (position) => set({ position }),
  })),
)

const $dot = document.getElementById('dot') as HTMLDivElement

$dot.addEventListener('mouseenter', (event) => {
  const parent = event.currentTarget.parentElement
  const parentWidth = parent.clientWidth
  const parentHeight = parent.clientHeight

  positionStore.getState().setPosition({
    x: Math.ceil(Math.random() * parentWidth),
    y: Math.ceil(Math.random() * parentHeight),
  })
})

const render: Parameters<typeof positionStore.subscribe>[0] = (state) => {
  $dot.style.transform = `translate(${state.position.x}px, ${state.position.y}px)`
}

render(positionStore.getInitialState(), positionStore.getInitialState())

positionStore.subscribe((state) => state.position, render)

const logger: Parameters<typeof positionStore.subscribe>[0] = (x) => {
  console.log('new x position', { x })
}

positionStore.subscribe((state) => state.position.x, logger)
```

这是html代码

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
