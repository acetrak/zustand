---
title: Flux启发实践
nav: 4
---

尽管 Zustand 是一个不拘一格的库，但我们确实推荐了一些模式。这些的灵感来自最初在 [Flux](https://github.com/facebookarchive/flux) 和最近的 [Redux](https://redux.js.org/understanding/thinking-in-redux/three-principles) 中发现的实践，所以如果您来自另一个库，您应该有宾至如归的感觉。

然而，Zustand 在一些基本方面确实有所不同，因此某些术语可能与其他库不完全一致。

## 推荐模式

### 单个store

您的应用程序全局状态应位于单个 Zustand 存储中。

如果您有大型应用程序，Zustand 支持将[商店拆分为切片](./slices-pattern.md)。

### 使用`set`/`setState`更新store

始终使用 `set` （或 `setState`）对您的商店执行更新。 `set（和` `setState`）确保所描述的更新正确合并并适当地通知侦听器。

### 托管store操作

在 Zustand 中，无需使用其他 Flux 库中的调度操作和减速器即可更新状态。这些商店操作可以直接添加到商店中，如下所示。

或者，通过使用 `setState`，它们可以[位于store外部](./practice-with-no-store-actions.md)

```js
const useBoundStore = create((set) => ({
  storeSliceA: ...,
  storeSliceB: ...,
  storeSliceC: ...,
  updateX: () => set(...),
  updateY: () => set(...),
}))
```

## 类似 Redux 的模式

如果你不能没有类似 Redux 的减速器，你可以在 store 的根级别定义一个`dispatch`函数：

```typescript
const types = { increase: 'INCREASE', decrease: 'DECREASE' }

const reducer = (state, { type, by = 1 }) => {
  switch (type) {
    case types.increase:
      return { grumpiness: state.grumpiness + by }
    case types.decrease:
      return { grumpiness: state.grumpiness - by }
  }
}

const useGrumpyStore = create((set) => ({
  grumpiness: 0,
  dispatch: (args) => set((state) => reducer(state, args)),
}))

const dispatch = useGrumpyStore((state) => state.dispatch)
dispatch({ type: types.increase, by: 2 })
```

您还可以使用我们的 redux 中间件。它连接你的主减速器，设置初始状态，并向状态本身和普通 api 添加调度函数。

```typescript
import { redux } from 'zustand/middleware'

const useReduxStore = create(redux(reducer, initialState))
```

更新存储的另一种方法是通过包装状态函数的函数。这些还可以处理操作的副作用。例如，使用 HTTP 调用。要以非反应式方式使用 Zustand，请参阅[Readme](https://github.com/pmndrs/zustand#readingwriting-state-and-reacting-to-changes-outside-of-components)。
