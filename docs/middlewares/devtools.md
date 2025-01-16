---
title: devtools
description: 如何进行时间旅行调试您的store 
nav: 205
---

# devtools

`devtools` 中间件允许您在没有 Redux 的情况下使用 [Redux DevTools 扩展](https://github.com/reduxjs/redux-devtools)。详细了解使用 [Redux DevTools 进行调试](https://redux.js.org/style-guide/#use-the-redux-devtools-extension-for-debugging)的好处。

```js
const nextStateCreatorFn = devtools(stateCreatorFn, devtoolsOptions)
```

## 类型

### 签名

```ts
devtools<T>(stateCreatorFn: StateCreator<T, [], []>, devtoolsOptions?: DevtoolsOptions): StateCreator<T, [['zustand/devtools', never]], []>
```

### 突变体

<!-- prettier-ignore-start -->
```ts
['zustand/devtools', never]
```
<!-- prettier-ignore-end -->

## 语法

### `devtools(stateCreatorFn, devtoolsOptions)`

#### 参数

- `stateCreatorFn`: 一个以 `set` 函数、`get` 函数和 `store` 作为参数的函数。通常，您将返回一个带有您想要公开的方法的对象。
- **可选** `devtoolsOptions`: 用于定义 `Redux Devtools` 选项的对象
  - **可选** `name`: Redux DevTools 中连接的自定义标识符。
  - **可选** `enabled`: 处于开发模式时默认为 `true`，处于生产模式时默认为 `false`。启用或禁用此商店的 Redux DevTools 集成。
  - **可选** `anonymousActionType`: 默认为`anonymous`。用作 Redux DevTools 中匿名突变的操作类型的字符串。
  - **可选** `store`: Redux DevTools 中存储的自定义标识符。

#### 返回

`devtools`  返回一个状态创建器函数。

## 用法

### 调试store

此示例向您展示如何使用 Redux Devtools 调试store

```ts
import { create, StateCreator } from 'zustand'
import { devtools } from 'zustand/middleware'

type JungleStore = {
  bears: number
  addBear: () => void
  fishes: number
  addFish: () => void
}

const useJungleStore = create<JungleStore>()(
  devtools((...args) => ({
    bears: 0,
    addBear: () =>
      set((state) => ({ bears: state.bears + 1 }), undefined, 'jungle/addBear'),
    fishes: 0,
    addFish: () =>
      set(
        (state) => ({ fishes: state.fishes + 1 }),
        undefined,
        'jungle/addFish',
      ),
  })),
)
```

### 调试基于切片模式的store

此示例向您展示如何使用 `Redux Devtools` 调试基于 Slices 模式的存储

```ts
import { create, StateCreator } from 'zustand'
import { devtools } from 'zustand/middleware'

type BearSlice = {
  bears: number
  addBear: () => void
}

type FishSlice = {
  fishes: number
  addFish: () => void
}

type JungleStore = BearSlice & FishSlice

const createBearSlice: StateCreator<
  JungleStore,
  [['zustand/devtools', never]],
  [],
  BearSlice
> = (set) => ({
  bears: 0,
  addBear: () =>
    set(
      (state) => ({ bears: state.bears + 1 }),
      undefined,
      'jungle:bear/addBear',
    ),
})

const createFishSlice: StateCreator<
  JungleStore,
  [['zustand/devtools', never]],
  [],
  FishSlice
> = (set) => ({
  fishes: 0,
  addFish: () =>
    set(
      (state) => ({ fishes: state.fishes + 1 }),
      undefined,
      'jungle:fish/addFish',
    ),
})

const useJungleStore = create<JungleStore>()(
  devtools((...args) => ({
    ...createBearSlice(...args),
    ...createFishSlice(...args),
  })),
)
```

## 故障排除

### 仅显示一个store

默认情况下，`Redux Devtools` 一次仅显示一个商店，因此为了查看其他商店，您需要使用商店选择器并选择不同的商店。

### 所有操作名称都标记为'anonymous'

如果未提供操作类型名称，则默认为“匿名”。您可以通过提供 `anonymousActionType` 参数来自定义此默认值：

例如，下一个示例没有操作类型名称：

```ts
import { create, StateCreator } from 'zustand'
import { devtools } from 'zustand/middleware'

type BearSlice = {
  bears: number
  addBear: () => void
}

type FishSlice = {
  fishes: number
  addFish: () => void
}

type JungleStore = BearSlice & FishSlice

const createBearSlice: StateCreator<
  JungleStore,
  [['zustand/devtools', never]],
  [],
  BearSlice
> = (set) => ({
  bears: 0,
  addBear: () => set((state) => ({ bears: state.bears + 1 })),
  eatFish: () => set((state) => ({ fishes: state.fishes - 1 })),
})

const createFishSlice: StateCreator<
  JungleStore,
  [['zustand/devtools', never]],
  [],
  FishSlice
> = (set) => ({
  fishes: 0,
  addFish: () => set((state) => ({ fishes: state.fishes + 1 })),
})

const useJungleStore = create<JungleStore>()(
  devtools((...args) => ({
    ...createBearSlice(...args),
    ...createFishSlice(...args),
  })),
)
```

为了修复前面的示例，我们需要提供一个操作类型名称作为第三个参数。此外，为了保留替换逻辑的默认行为，第二个参数应设置为`undefined`。

这是之前的固定示例

```ts
import { create, StateCreator } from 'zustand'

type BearSlice = {
  bears: number
  addBear: () => void
}

type FishSlice = {
  fishes: number
  addFish: () => void
}

type JungleStore = BearSlice & FishSlice

const createBearSlice: StateCreator<
  JungleStore,
  [['zustand/devtools', never]],
  [],
  BearSlice
> = (set) => ({
  bears: 0,
  addBear: () =>
    set((state) => ({ bears: state.bears + 1 }), undefined, 'bear/addBear'),
})

const createFishSlice: StateCreator<
  JungleStore,
  [['zustand/devtools', never]],
  [],
  FishSlice
> = (set) => ({
  fishes: 0,
  addFish: () =>
    set((state) => ({ fishes: state.fishes + 1 }), undefined, 'fish/addFish'),
})

const useJungleStore = create<JungleStore>()(
  devtools((...args) => ({
    ...createBearSlice(...args),
    ...createFishSlice(...args),
  })),
)
```

:::warning
不要将第二个参数设置为 `true` 或 `false`，除非您想覆盖默认的替换逻辑
:::
