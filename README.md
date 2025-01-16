<p align="center">
  <img src="docs/bear.jpg" />
</p>

[![Build Status](https://img.shields.io/github/actions/workflow/status/pmndrs/zustand/lint-and-type.yml?branch=main&style=flat&colorA=000000&colorB=000000)](https://github.com/pmndrs/zustand/actions?query=workflow%3ALint)
[![Build Size](https://img.shields.io/bundlephobia/minzip/zustand?label=bundle%20size&style=flat&colorA=000000&colorB=000000)](https://bundlephobia.com/result?p=zustand)
[![Version](https://img.shields.io/npm/v/zustand?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/zustand)
[![Downloads](https://img.shields.io/npm/dt/zustand.svg?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/zustand)
[![Discord Shield](https://img.shields.io/discord/740090768164651008?style=flat&colorA=000000&colorB=000000&label=discord&logo=discord&logoColor=ffffff)](https://discord.gg/poimandres)

一种小型、快速且可扩展的 Bearbones 状态管理解决方案，使用简化的通量原理。拥有基于钩子的舒适 API，不是样板文件或固执己见。

不要因为它可爱而忽视它。它有相当多的爪子，大量的时间花在处理常见的陷阱上，比如可怕的[僵尸子问题](https://react-redux.js.org/api/hooks#stale-props-and-zombie-children)、[React 并发](https://github.com/bvaughn/rfcs/blob/useMutableSource/text/0000-use-mutable-source.md)和混合渲染器之间的[上下文丢失](https://github.com/facebook/react/issues/13332)。它可能是 React 领域中唯一一个能够满足所有这些要求的状态管理器。

您可以在[这里](https://githubbox.com/pmndrs/zustand/tree/main/examples/demo)尝试演示。

```bash
npm install zustand
```

:warning: 本自述文件是为 JavaScript 用户编写的。如果您是 TypeScript 用户，请务必查看我们的 [TypeScript](#typescript-usage) 使用部分。

## 首先创建一个store

你的store是一个钩子！您可以在其中放入任何内容：原始值、对象、函数。状态必须不可变地更新，并且 `set` 函数[合并状态](./docs/guides/immutable-state-and-merging.md)来帮助它。

```jsx
import { create } from 'zustand'

const useBearStore = create((set) => ({
  bears: 0,
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  removeAllBears: () => set({ bears: 0 }),
}))
```

## 然后绑定您的组件，就这样！

在任何地方使用钩子，不需要提供者。选择您的状态，组件将根据更改重新呈现。

```jsx
function BearCounter() {
  const bears = useBearStore((state) => state.bears)
  return <h1>{bears} around here ...</h1>
}

function Controls() {
  const increasePopulation = useBearStore((state) => state.increasePopulation)
  return <button onClick={increasePopulation}>one up</button>
}
```

### 为什么 是zustand 而不是 redux？

- 简单且不带主见
- 使钩子成为消费状态的主要手段
- 不会将您的应用程序包装在上下文提供程序中
- [可以瞬时通知组件 (不会导致渲染)](#transient-updates-for-often-occurring-state-changes)

### 为什么要在上下文中？

- 更少的样板文件
- 仅在更改时渲染组件
- 集中式、基于行动的状态管理

---

# 语法

## 获取所有内容

您可以，但请记住，这将导致组件在每次状态更改时更新！

```jsx
const state = useBearStore()
```

## 选择多个状态切片

默认情况下，它以严格相等（旧 === 新）检测更改，这对于原子状态选择非常有效。

```jsx
const nuts = useBearStore((state) => state.nuts)
const honey = useBearStore((state) => state.honey)
```

如果你想构造一个内部有多个state-picks的单个对象，类似于redux的mapStateToProps，你可以使用[useShallow](./docs/guides/prevent-rerenders-with-use-shallow.md)来防止当选择器输出没有根据shallow equal改变时不必要的重新渲染。

```jsx
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

const useBearStore = create((set) => ({
  nuts: 0,
  honey: 0,
  treats: {},
  // ...
}))

// Object pick, re-renders the component when either state.nuts or state.honey change
const { nuts, honey } = useBearStore(
  useShallow((state) => ({ nuts: state.nuts, honey: state.honey })),
)

// Array pick, re-renders the component when either state.nuts or state.honey change
const [nuts, honey] = useBearStore(
  useShallow((state) => [state.nuts, state.honey]),
)

// Mapped picks, re-renders the component when state.treats changes in order, count or keys
const treats = useBearStore(useShallow((state) => Object.keys(state.treats)))
```

为了更好地控制重新渲染，您可以提供任何自定义相等函数（此示例需要使用 [`createWithEqualityFn`](./docs/migrations/migrating-to-v5.md#using-custom-equality-functions-such-as-shallow)）。

```jsx
const treats = useBearStore(
  (state) => state.treats,
  (oldTreats, newTreats) => compare(oldTreats, newTreats),
)
```

## 覆盖状态

`set` 函数有第二个参数，默认为 `false`。它将取代状态模型，而不是合并。小心不要抹掉你依赖的部分，比如actions。

```jsx
import omit from 'lodash-es/omit'

const useFishStore = create((set) => ({
  salmon: 1,
  tuna: 2,
  deleteEverything: () => set({}, true), // clears the entire store, actions included
  deleteTuna: () => set((state) => omit(state, ['tuna']), true),
}))
```

## 异步 actions

当你准备好时只需调用 `set` 即可，zustand 并不关心你的操作是否异步。

```jsx
const useFishStore = create((set) => ({
  fishies: {},
  fetch: async (pond) => {
    const response = await fetch(pond)
    set({ fishies: await response.json() })
  },
}))
```

## 从actions中的状态读取

`set` 允许 `fn-updates set(state => result)`，但您仍然可以通过 `get` 访问其之外的状态。

```jsx
const useSoundStore = create((set, get) => ({
  sound: 'grunt',
  action: () => {
    const sound = get().sound
    ...
```

## 读/写状态并对组件外部的变化做出反应

有时您需要以非响应方式访问状态或对存储进行操作。对于这些情况，生成的钩子具有附加到其原型的实用函数。

:warning: 不建议在 [React Server 组件](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md)中添加状态（通常在 Next.js 13 及更高版本中）。它可能会给您的用户带来意想不到的错误和隐私问题。有关更多详细信息，请参阅[#2200](https://github.com/pmndrs/zustand/discussions/2200)。

```jsx
const useDogStore = create(() => ({ paw: true, snout: true, fur: true }))

// Getting non-reactive fresh state
const paw = useDogStore.getState().paw
// Listening to all changes, fires synchronously on every change
const unsub1 = useDogStore.subscribe(console.log)
// Updating state, will trigger listeners
useDogStore.setState({ paw: false })
// Unsubscribe listeners
unsub1()

// You can of course use the hook as you always would
function Component() {
  const paw = useDogStore((state) => state.paw)
  ...
```

### 使用带有选择器的订阅

如果您需要使用选择器进行订阅，则 `subscribeWithSelector` 中间件会有所帮助。

使用此中间件， `subscribe`接受附加签名：

```ts
subscribe(selector, callback, options?: { equalityFn, fireImmediately }): Unsubscribe
```

```js
import { subscribeWithSelector } from 'zustand/middleware'
const useDogStore = create(
  subscribeWithSelector(() => ({ paw: true, snout: true, fur: true })),
)

// Listening to selected changes, in this case when "paw" changes
const unsub2 = useDogStore.subscribe((state) => state.paw, console.log)
// Subscribe also exposes the previous value
const unsub3 = useDogStore.subscribe(
  (state) => state.paw,
  (paw, previousPaw) => console.log(paw, previousPaw),
)
// Subscribe also supports an optional equality function
const unsub4 = useDogStore.subscribe(
  (state) => [state.paw, state.fur],
  console.log,
  { equalityFn: shallow },
)
// Subscribe and fire immediately
const unsub5 = useDogStore.subscribe((state) => state.paw, console.log, {
  fireImmediately: true,
})
```

## 使用 zustand 而不使用 React

Zustand 核心可以在没有 React 依赖的情况下导入和使用。唯一的区别是 create 函数不返回钩子，而是返回 API 实用程序。

```jsx
import { createStore } from 'zustand/vanilla'

const store = createStore((set) => ...)
const { getState, setState, subscribe, getInitialState } = store

export default store
```

You can use a vanilla store with `useStore` hook available since v4.

```jsx
import { useStore } from 'zustand'
import { vanillaStore } from './vanillaStore'

const useBoundStore = (selector) => useStore(vanillaStore, selector)
```

:warning: 注意，修改`set`或`get`的中间件不适用于`getState`和`setState`。

## 瞬时更新（针对经常发生的状态更改）

subscribe 函数允许组件绑定到状态部分，而无需在更改时强制重新渲染。最好将其与 useEffect 结合起来，以便在卸载时自动取消订阅。当您被允许直接改变视图时，这可能会对性能[产生巨大](https://codesandbox.io/s/peaceful-johnson-txtws)的影响。

```jsx
const useScratchStore = create((set) => ({ scratches: 0, ... }))

const Component = () => {
  // Fetch initial state
  const scratchRef = useRef(useScratchStore.getState().scratches)
  // Connect to the store on mount, disconnect on unmount, catch state-changes in a reference
  useEffect(() => useScratchStore.subscribe(
    state => (scratchRef.current = state.scratches)
  ), [])
  ...
```

## 厌倦了reducers 和改变嵌套状态？使用Immer!


减少嵌套结构是很烦人的。你尝试过[immer](https://github.com/mweststrate/immer)吗？

```jsx
import { produce } from 'immer'

const useLushStore = create((set) => ({
  lush: { forest: { contains: { a: 'bear' } } },
  clearForest: () =>
    set(
      produce((state) => {
        state.lush.forest.contains = null
      }),
    ),
}))

const clearForest = useLushStore((state) => state.clearForest)
clearForest()
```

[或者，还有一些其他解决方案。](./docs/guides/updating-state.md#with-immer)

## 持久化中间件

您可以使用任何类型的存储来保留商店的数据。

```jsx
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const useFishStore = create(
  persist(
    (set, get) => ({
      fishes: 0,
      addAFish: () => set({ fishes: get().fishes + 1 }),
    }),
    {
      name: 'food-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    },
  ),
)
```

[请参阅此中间件的完整文档。](./docs/integrations/persisting-store-data.md)

## Immer 中间件

Immer 也可用作中间件。

```jsx
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

const useBeeStore = create(
  immer((set) => ({
    bees: 0,
    addBees: (by) =>
      set((state) => {
        state.bees += by
      }),
  })),
)
```

## 没有类似 redux 的reducers和action types就无法生存吗？

```jsx
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

或者，只需使用我们的 redux 中间件。它连接你的 main-reducer，设置初始状态，并向状态本身和普通 API 添加调度函数。

```jsx
import { redux } from 'zustand/middleware'

const useGrumpyStore = create(redux(reducer, initialState))
```

## Redux 开发工具

安装[Redux DevTools Chrome extension](https://chromewebstore.google.com/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd) 扩展以使用 devtools 中间件。

```jsx
import { devtools } from 'zustand/middleware'

// Usage with a plain action store, it will log actions as "setState"
const usePlainStore = create(devtools((set) => ...))
// Usage with a redux store, it will log full action types
const useReduxStore = create(devtools(redux(reducer, initialState)))
```

一个 redux devtools 连接可连接多个 stores

```jsx
import { devtools } from 'zustand/middleware'

// Usage with a plain action store, it will log actions as "setState"
const usePlainStore1 = create(devtools((set) => ..., { name, store: storeName1 }))
const usePlainStore2 = create(devtools((set) => ..., { name, store: storeName2 }))
// Usage with a redux store, it will log full action types
const useReduxStore = create(devtools(redux(reducer, initialState)), , { name, store: storeName3 })
const useReduxStore = create(devtools(redux(reducer, initialState)), , { name, store: storeName4 })
```

分配不同的连接名称将在 redux devtools 中分隔存储。这也有助于将不同的存储分组到单独的 redux devtools 连接中。

devtools 将存储函数作为其第一个参数，您可以选择使用第二个参数命名存储或配置[序列化](https://github.com/zalmoxisus/redux-devtools-extension/blob/master/docs/API/Arguments.md#serialize)选项。

Name store：`devtools(..., {name: "MyStore"})`，这将在 devtools 中创建一个名为“MyStore”的单独实例。

Serialize options: `devtools(..., { serialize: { options: true } })`.

#### 记录 Actions

与典型的组合减速器 Redux 存储不同，devtools 将仅记录来自每个单独存储的操作。查看合并商店的方法[#163](https://github.com/pmndrs/zustand/issues/163)

您可以通过传递第三个参数来记录每个`set`函数的特定操作类型：

```jsx
const useBearStore = create(devtools((set) => ({
  ...
  eatFish: () => set(
    (prev) => ({ fishes: prev.fishes > 1 ? prev.fishes - 1 : 0 }),
    undefined,
    'bear/eatFish'
  ),
  ...
```

您还可以记录操作的类型及其有payload:

```jsx
  ...
  addFishes: (count) => set(
    (prev) => ({ fishes: prev.fishes + count }),
    undefined,
    { type: 'bear/addFishes', count, }
  ),
  ...
```

如果未提供操作类型，则默认为“匿名”。您可以通过提供 `anonymousActionType` 参数来自定义此默认值：

```jsx
devtools(..., { anonymousActionType: 'unknown', ... })
```

如果您希望禁用开发工具（例如在生产环境中）。您可以通过提供`enabled`的参数来自定义此设置：

```jsx
devtools(..., { enabled: false, ... })
```

## React 上下文

使用 `create` 创建的存储不需要上下文提供程序。在某些情况下，您可能想要使用上下文进行依赖项注入，或者想要使用组件中的 props 初始化存储。因为普通存储是一个钩子，所以将其作为普通上下文值传递可能会违反钩子规则。

自 v4 以来推荐的可用方法是使用 vanilla store。

```jsx
import { createContext, useContext } from 'react'
import { createStore, useStore } from 'zustand'

const store = createStore(...) // vanilla store without hooks

const StoreContext = createContext()

const App = () => (
  <StoreContext.Provider value={store}>
    ...
  </StoreContext.Provider>
)

const Component = () => {
  const store = useContext(StoreContext)
  const slice = useStore(store, selector)
  ...
```

## TypeScript 用法

基本的TypeScript用法不需要​​任何特殊的东西，除了编写 `create<State>()(...)` 而不是 `create(...)`...

```ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type {} from '@redux-devtools/extension' // required for devtools typing

interface BearState {
  bears: number
  increase: (by: number) => void
}

const useBearStore = create<BearState>()(
  devtools(
    persist(
      (set) => ({
        bears: 0,
        increase: (by) => set((state) => ({ bears: state.bears + by })),
      }),
      {
        name: 'bear-storage',
      },
    ),
  ),
)
```

更完整的 TypeScript 指南位于[此处](docs/guides/typescript.md)。

## 最佳实践

- 您可能想知道如何组织代码以更好地进行维护: [将store拆分为单独的片](./docs/guides/slices-pattern.md).
- 这个不拘一格的库的推荐用法: [Flux 启发的实践](./docs/guides/flux-inspired-practice.md).
- [在 React 18 之前的版本中调用 React 事件处理程序外部的操作](./docs/guides/event-handler-in-pre-react-18.md).
- [测试](./docs/guides/testing.md)
- 有关更多信息，请查看 [docs](./docs/) 文件夹

## 第三方库

一些用户可能想要扩展 Zustand 的功能集，这可以使用社区制作的第三方库来完成。有关 Zustand 第三方库的信息，请访问[文档](./docs/integrations/third-party-libraries.md)。

## 与其他库的比较

- [zustand 与 React 其他状态管理库的区别](https://docs.pmnd.rs/zustand/getting-started/comparison)
