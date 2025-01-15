---
title: useStoreWithEqualityFn ⚛️
description: 如何在 React 中有效使用原生存储
nav: 29
---

`useStoreWithEqualityFn` 是一个 React Hook，可让您在 React 中使用普通存储，就像 `useStore` 一样。但是，它提供了一种定义自定义相等性检查的方法。这样可以更精细地控制组件何时重新渲染，从而提高性能和响应能力。

```js
const someState = useStoreWithEqualityFn(store, selectorFn, equalityFn)
```

### 签名

```ts
useStoreWithEqualityFn<T, U = T>(store: StoreApi<T>, selectorFn: (state: T) => U, equalityFn?: (a: T, b: T) => boolean): U
```

## 语法

### `useStoreWithEqualityFn(store, selectorFn, equalityFn)`

#### 参数

- `storeApi`: 允许您访问存储 API 实用程序的实例。
- `selectorFn`: 一个可让您返回基于当前状态的数据的函数。
- `equalityFn`: 一个可以让您跳过重新渲染的函数。

#### 返回

`useStoreWithEqualityFn` 根据选择器函数返回基于当前状态的任何数据，并允许您使用相等函数跳过重新渲染。它应该接受一个存储、一个选择器函数和一个相等函数作为参数。

## 使用

### 在 React 中使用全局原生存储

首先，让我们设置一个存储点来保存屏幕上的点的位置。我们将定义存储来管理 `x` 和 `y` 坐标并提供更新这些坐标的操作。

```tsx
import { createStore, useStore } from 'zustand'

type PositionStoreState = { position: { x: number; y: number } }

type PositionStoreActions = {
  setPosition: (nextPosition: PositionStoreState['position']) => void
}

type PositionStore = PositionStoreState & PositionStoreActions

const positionStore = createStore<PositionStore>()((set) => ({
  position: { x: 0, y: 0 },
  setPosition: (position) => set({ position }),
}))
```

接下来，我们将创建一个 `MovingDot` 组件，用于呈现代表点的 div。该组件将使用存储来跟踪和更新点的位置。

```tsx
function MovingDot() {
  const position = useStoreWithEqualityFn(
    positionStore,
    (state) => state.position,
    shallow,
  )
  const setPosition = useStoreWithEqualityFn(
    positionStore,
    (state) => state.setPosition,
    shallow,
  )

  return (
    <div
      onPointerMove={(e) => {
        setPosition({
          x: e.clientX,
          y: e.clientY,
        })
      }}
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
      }}
    >
      <div
        style={{
          position: 'absolute',
          backgroundColor: 'red',
          borderRadius: '50%',
          transform: `translate(${position.x}px, ${position.y}px)`,
          left: -10,
          top: -10,
          width: 20,
          height: 20,
        }}
      />
    </div>
  )
}
```

最后，我们将在 `App` 组件中渲染 `MovingDot` 组件。

```tsx
export default function App() {
  return <MovingDot />
}
```

代码应如下所示：

```tsx
import { createStore } from 'zustand'
import { useStoreWithEqualityFn } from 'zustand/traditional'
import { shallow } from 'zustand/shallow'

type PositionStoreState = { position: { x: number; y: number } }

type PositionStoreActions = {
  setPosition: (nextPosition: PositionStoreState['position']) => void
}

type PositionStore = PositionStoreState & PositionStoreActions

const positionStore = createStore<PositionStore>()((set) => ({
  position: { x: 0, y: 0 },
  setPosition: (position) => set({ position }),
}))

function MovingDot() {
  const position = useStoreWithEqualityFn(
    positionStore,
    (state) => state.position,
    shallow,
  )
  const setPosition = useStoreWithEqualityFn(
    positionStore,
    (state) => state.setPosition,
    shallow,
  )

  return (
    <div
      onPointerMove={(e) => {
        setPosition({
          x: e.clientX,
          y: e.clientY,
        })
      }}
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
      }}
    >
      <div
        style={{
          position: 'absolute',
          backgroundColor: 'red',
          borderRadius: '50%',
          transform: `translate(${position.x}px, ${position.y}px)`,
          left: -10,
          top: -10,
          width: 20,
          height: 20,
        }}
      />
    </div>
  )
}

export default function App() {
  return <MovingDot />
}
```

### 在 React 中使用动态全局原生存储

首先，我们将创建一个工厂函数，它生成一个用于管理计数器状态的存储。每个选项卡都有自己的该商店实例。

```ts
import { createStore } from 'zustand'

type CounterState = {
  count: number
}

type CounterActions = { increment: () => void }

type CounterStore = CounterState & CounterActions

const createCounterStore = () => {
  return createStore<CounterStore>()((set) => ({
    count: 0,
    increment: () => {
      set((state) => ({ count: state.count + 1 }))
    },
  }))
}
```

接下来，我们将创建一个工厂函数来管理柜台商店的创建和检索。这允许每个选项卡都有自己独立的计数器。

```ts
const defaultCounterStores = new Map<
  string,
  ReturnType<typeof createCounterStore>
>()

const createCounterStoreFactory = (
  counterStores: typeof defaultCounterStores,
) => {
  return (counterStoreKey: string) => {
    if (!counterStores.has(counterStoreKey)) {
      counterStores.set(counterStoreKey, createCounterStore())
    }
    return counterStores.get(counterStoreKey)!
  }
}

const getOrCreateCounterStoreByKey =
  createCounterStoreFactory(defaultCounterStores)
```

现在，让我们构建选项卡组件，用户可以在选项卡之间切换并增加每个选项卡的计数器。

```tsx
const [currentTabIndex, setCurrentTabIndex] = useState(0)
const counterState = useStoreWithEqualityFn(
  getOrCreateCounterStoreByKey(`tab-${currentTabIndex}`),
  (state) => state,
  shallow,
)

return (
  <div style={{ fontFamily: 'monospace' }}>
    <div
      style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid salmon',
        paddingBottom: 4,
      }}
    >
      <button
        type="button"
        style={{
          border: '1px solid salmon',
          backgroundColor: '#fff',
          cursor: 'pointer',
        }}
        onClick={() => setCurrentTabIndex(0)}
      >
        Tab 1
      </button>
      <button
        type="button"
        style={{
          border: '1px solid salmon',
          backgroundColor: '#fff',
          cursor: 'pointer',
        }}
        onClick={() => setCurrentTabIndex(1)}
      >
        Tab 2
      </button>
      <button
        type="button"
        style={{
          border: '1px solid salmon',
          backgroundColor: '#fff',
          cursor: 'pointer',
        }}
        onClick={() => setCurrentTabIndex(2)}
      >
        Tab 3
      </button>
    </div>
    <div style={{ padding: 4 }}>
      Content of Tab {currentTabIndex + 1}
      <br /> <br />
      <button type="button" onClick={() => counterState.increment()}>
        Count: {counterState.count}
      </button>
    </div>
  </div>
)
```

最后，我们将创建 `App` 组件，它呈现选项卡及其各自的计数器。每个选项卡的计数器状态都是独立管理的。

```tsx
export default function App() {
  return <Tabs />
}
```

代码应如下所示：:

```tsx
import { useState } from 'react'
import { createStore } from 'zustand'
import { useStoreWithEqualityFn } from 'zustand/traditional'
import { shallow } from 'zustand/shallow'

type CounterState = {
  count: number
}

type CounterActions = { increment: () => void }

type CounterStore = CounterState & CounterActions

const createCounterStore = () => {
  return createStore<CounterStore>()((set) => ({
    count: 0,
    increment: () => {
      set((state) => ({ count: state.count + 1 }))
    },
  }))
}

const defaultCounterStores = new Map<
  string,
  ReturnType<typeof createCounterStore>
>()

const createCounterStoreFactory = (
  counterStores: typeof defaultCounterStores,
) => {
  return (counterStoreKey: string) => {
    if (!counterStores.has(counterStoreKey)) {
      counterStores.set(counterStoreKey, createCounterStore())
    }
    return counterStores.get(counterStoreKey)!
  }
}

const getOrCreateCounterStoreByKey =
  createCounterStoreFactory(defaultCounterStores)

export default function App() {
  const [currentTabIndex, setCurrentTabIndex] = useState(0)
  const counterState = useStoreWithEqualityFn(
    getOrCreateCounterStoreByKey(`tab-${currentTabIndex}`),
    (state) => state,
    shallow,
  )

  return (
    <div style={{ fontFamily: 'monospace' }}>
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid salmon',
          paddingBottom: 4,
        }}
      >
        <button
          type="button"
          style={{
            border: '1px solid salmon',
            backgroundColor: '#fff',
            cursor: 'pointer',
          }}
          onClick={() => setCurrentTabIndex(0)}
        >
          Tab 1
        </button>
        <button
          type="button"
          style={{
            border: '1px solid salmon',
            backgroundColor: '#fff',
            cursor: 'pointer',
          }}
          onClick={() => setCurrentTabIndex(1)}
        >
          Tab 2
        </button>
        <button
          type="button"
          style={{
            border: '1px solid salmon',
            backgroundColor: '#fff',
            cursor: 'pointer',
          }}
          onClick={() => setCurrentTabIndex(2)}
        >
          Tab 3
        </button>
      </div>
      <div style={{ padding: 4 }}>
        Content of Tab {currentTabIndex + 1}
        <br /> <br />
        <button type="button" onClick={() => counterState.increment()}>
          Count: {counterState.count}
        </button>
      </div>
    </div>
  )
}
```

### 在 React 中使用作用域（非全局）普通存储

首先，让我们设置一个存储点来保存屏幕上的点的位置。我们将定义存储来管理 `x` 和 `y` 坐标并提供更新这些坐标的操作。

```tsx
type PositionStoreState = { position: { x: number; y: number } }

type PositionStoreActions = {
  setPosition: (nextPosition: PositionStoreState['position']) => void
}

type PositionStore = PositionStoreState & PositionStoreActions

const createPositionStore = () => {
  return createStore<PositionStore>()((set) => ({
    position: { x: 0, y: 0 },
    setPosition: (position) => set({ position }),
  }))
}
```

接下来，我们将创建一个上下文和一个提供程序组件，以通过 React 组件树向下传递存储。这允许每个 `MovingDot` 组件拥有自己的独立状态。

```tsx
const PositionStoreContext = createContext<ReturnType<
  typeof createPositionStore
> | null>(null)

function PositionStoreProvider({ children }: { children: ReactNode }) {
  const [positionStore] = useState(createPositionStore)

  return (
    <PositionStoreContext.Provider value={positionStore}>
      {children}
    </PositionStoreContext.Provider>
  )
}
```

为了简化对商店的访问，我们将创建一个 React 自定义钩子 `usePositionStore`。这个钩子将从上下文中读取存储并允许我们选择状态的特定部分。

```ts
function usePositionStore<U>(selector: (state: PositionStore) => U) {
  const store = useContext(PositionStoreContext)

  if (store === null) {
    throw new Error(
      'usePositionStore must be used within PositionStoreProvider',
    )
  }

  return useStoreWithEqualityFn(store, selector, shallow)
}
```

现在，让我们创建 `MovingDot` 组件，它将在其容器内呈现一个跟随鼠标光标的点。

```tsx
function MovingDot({ color }: { color: string }) {
  const position = usePositionStore((state) => state.position)
  const setPosition = usePositionStore((state) => state.setPosition)

  return (
    <div
      onPointerMove={(e) => {
        setPosition({
          x:
            e.clientX > e.currentTarget.clientWidth
              ? e.clientX - e.currentTarget.clientWidth
              : e.clientX,
          y: e.clientY,
        })
      }}
      style={{
        position: 'relative',
        width: '50vw',
        height: '100vh',
      }}
    >
      <div
        style={{
          position: 'absolute',
          backgroundColor: color,
          borderRadius: '50%',
          transform: `translate(${position.x}px, ${position.y}px)`,
          left: -10,
          top: -10,
          width: 20,
          height: 20,
        }}
      />
    </div>
  )
}
```

最后，我们将在 `App` 组件中将所有内容整合在一起，在其中渲染两个 `MovingDot` 组件，每个组件都有自己的独立状态。

```tsx
export default function App() {
  return (
    <div style={{ display: 'flex' }}>
      <PositionStoreProvider>
        <MovingDot color="red" />
      </PositionStoreProvider>
      <PositionStoreProvider>
        <MovingDot color="blue" />
      </PositionStoreProvider>
    </div>
  )
}
```

代码应如下所示：

```tsx
import { type ReactNode, useState, createContext, useContext } from 'react'
import { createStore } from 'zustand'
import { useStoreWithEqualityFn } from 'zustand/traditional'
import { shallow } from 'zustand/shallow'

type PositionStoreState = { position: { x: number; y: number } }

type PositionStoreActions = {
  setPosition: (nextPosition: PositionStoreState['position']) => void
}

type PositionStore = PositionStoreState & PositionStoreActions

const createPositionStore = () => {
  return createStore<PositionStore>()((set) => ({
    position: { x: 0, y: 0 },
    setPosition: (position) => set({ position }),
  }))
}

const PositionStoreContext = createContext<ReturnType<
  typeof createPositionStore
> | null>(null)

function PositionStoreProvider({ children }: { children: ReactNode }) {
  const [positionStore] = useState(createPositionStore)

  return (
    <PositionStoreContext.Provider value={positionStore}>
      {children}
    </PositionStoreContext.Provider>
  )
}

function usePositionStore<U>(selector: (state: PositionStore) => U) {
  const store = useContext(PositionStoreContext)

  if (store === null) {
    throw new Error(
      'usePositionStore must be used within PositionStoreProvider',
    )
  }

  return useStoreWithEqualityFn(store, selector, shallow)
}

function MovingDot({ color }: { color: string }) {
  const position = usePositionStore((state) => state.position)
  const setPosition = usePositionStore((state) => state.setPosition)

  return (
    <div
      onPointerMove={(e) => {
        setPosition({
          x:
            e.clientX > e.currentTarget.clientWidth
              ? e.clientX - e.currentTarget.clientWidth
              : e.clientX,
          y: e.clientY,
        })
      }}
      style={{
        position: 'relative',
        width: '50vw',
        height: '100vh',
      }}
    >
      <div
        style={{
          position: 'absolute',
          backgroundColor: color,
          borderRadius: '50%',
          transform: `translate(${position.x}px, ${position.y}px)`,
          left: -10,
          top: -10,
          width: 20,
          height: 20,
        }}
      />
    </div>
  )
}

export default function App() {
  return (
    <div style={{ display: 'flex' }}>
      <PositionStoreProvider>
        <MovingDot color="red" />
      </PositionStoreProvider>
      <PositionStoreProvider>
        <MovingDot color="blue" />
      </PositionStoreProvider>
    </div>
  )
}
```

### 在 React 中使用动态范围（非全局）普通存储

首先，我们将创建一个工厂函数，它生成一个用于管理计数器状态的存储。每个选项卡都有自己的该商店实例。

```ts
type CounterState = {
  count: number
}

type CounterActions = { increment: () => void }

type CounterStore = CounterState & CounterActions

const createCounterStore = () => {
  return createStore<CounterStore>()((set) => ({
    count: 0,
    increment: () => {
      set((state) => ({ count: state.count + 1 }))
    },
  }))
}
```

接下来，我们将创建一个工厂函数来管理柜台商店的创建和检索。这允许每个选项卡都有自己独立的计数器。

```ts
const createCounterStoreFactory = (
  counterStores: Map<string, ReturnType<typeof createCounterStore>>,
) => {
  return (counterStoreKey: string) => {
    if (!counterStores.has(counterStoreKey)) {
      counterStores.set(counterStoreKey, createCounterStore())
    }
    return counterStores.get(counterStoreKey)!
  }
}
```

接下来，我们需要一种方法来在我们的应用程序中管理和访问这些商店。为此，我们将使用 React 的上下文。

```tsx
const CounterStoresContext = createContext(null)

const CounterStoresProvider = ({ children }) => {
  const [stores] = useState(
    () => new Map<string, ReturnType<typeof createCounterStore>>(),
  )

  return (
    <CounterStoresContext.Provider value={stores}>
      {children}
    </CounterStoresContext.Provider>
  )
}
```

现在，我们将创建一个自定义挂钩 `useCounterStore`，它允许我们访问给定选项卡的正确存储。

```tsx
const useCounterStore = <U,>(
  currentTabIndex: number,
  selector: (state: CounterStore) => U,
) => {
  const stores = useContext(CounterStoresContext)

  if (stores === undefined) {
    throw new Error('useCounterStore must be used within CounterStoresProvider')
  }

  const getOrCreateCounterStoreByKey = useCallback(
    () => createCounterStoreFactory(stores),
    [stores],
  )

  return useStoreWithEqualityFn(
    getOrCreateCounterStoreByKey(`tab-${currentTabIndex}`),
    selector,
    shallow,
  )
}
```

现在，让我们构建选项卡组件，用户可以在选项卡之间切换并增加每个选项卡的计数器。

```tsx
function Tabs() {
  const [currentTabIndex, setCurrentTabIndex] = useState(0)
  const counterState = useCounterStore(
    `tab-${currentTabIndex}`,
    (state) => state,
  )

  return (
    <div style={{ fontFamily: 'monospace' }}>
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid salmon',
          paddingBottom: 4,
        }}
      >
        <button
          type="button"
          style={{
            border: '1px solid salmon',
            backgroundColor: '#fff',
            cursor: 'pointer',
          }}
          onClick={() => setCurrentTabIndex(0)}
        >
          Tab 1
        </button>
        <button
          type="button"
          style={{
            border: '1px solid salmon',
            backgroundColor: '#fff',
            cursor: 'pointer',
          }}
          onClick={() => setCurrentTabIndex(1)}
        >
          Tab 2
        </button>
        <button
          type="button"
          style={{
            border: '1px solid salmon',
            backgroundColor: '#fff',
            cursor: 'pointer',
          }}
          onClick={() => setCurrentTabIndex(2)}
        >
          Tab 3
        </button>
      </div>
      <div style={{ padding: 4 }}>
        Content of Tab {currentTabIndex + 1}
        <br /> <br />
        <button type="button" onClick={() => counterState.increment()}>
          Count: {counterState.count}
        </button>
      </div>
    </div>
  )
}
```

最后，我们将创建 `App` 组件，它呈现选项卡及其各自的计数器。每个选项卡的计数器状态都是独立管理的。



```tsx
export default function App() {
  return (
    <CounterStoresProvider>
      <Tabs />
    </CounterStoresProvider>
  )
}
```

代码应如下所示：

```tsx
import {
  type ReactNode,
  useState,
  useCallback,
  useContext,
  createContext,
} from 'react'
import { createStore, useStore } from 'zustand'

type CounterState = {
  count: number
}

type CounterActions = { increment: () => void }

type CounterStore = CounterState & CounterActions

const createCounterStore = () => {
  return createStore<CounterStore>()((set) => ({
    count: 0,
    increment: () => {
      set((state) => ({ count: state.count + 1 }))
    },
  }))
}

const createCounterStoreFactory = (
  counterStores: Map<string, ReturnType<typeof createCounterStore>>,
) => {
  return (counterStoreKey: string) => {
    if (!counterStores.has(counterStoreKey)) {
      counterStores.set(counterStoreKey, createCounterStore())
    }
    return counterStores.get(counterStoreKey)!
  }
}

const CounterStoresContext = createContext<Map<
  string,
  ReturnType<typeof createCounterStore>
> | null>(null)

const CounterStoresProvider = ({ children }: { children: ReactNode }) => {
  const [stores] = useState(
    () => new Map<string, ReturnType<typeof createCounterStore>>(),
  )

  return (
    <CounterStoresContext.Provider value={stores}>
      {children}
    </CounterStoresContext.Provider>
  )
}

const useCounterStore = <U,>(
  key: string,
  selector: (state: CounterStore) => U,
) => {
  const stores = useContext(CounterStoresContext)

  if (stores === undefined) {
    throw new Error('useCounterStore must be used within CounterStoresProvider')
  }

  const getOrCreateCounterStoreByKey = useCallback(
    (key: string) => createCounterStoreFactory(stores!)(key),
    [stores],
  )

  return useStore(getOrCreateCounterStoreByKey(key), selector)
}

function Tabs() {
  const [currentTabIndex, setCurrentTabIndex] = useState(0)
  const counterState = useCounterStore(
    `tab-${currentTabIndex}`,
    (state) => state,
  )

  return (
    <div style={{ fontFamily: 'monospace' }}>
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid salmon',
          paddingBottom: 4,
        }}
      >
        <button
          type="button"
          style={{
            border: '1px solid salmon',
            backgroundColor: '#fff',
            cursor: 'pointer',
          }}
          onClick={() => setCurrentTabIndex(0)}
        >
          Tab 1
        </button>
        <button
          type="button"
          style={{
            border: '1px solid salmon',
            backgroundColor: '#fff',
            cursor: 'pointer',
          }}
          onClick={() => setCurrentTabIndex(1)}
        >
          Tab 2
        </button>
        <button
          type="button"
          style={{
            border: '1px solid salmon',
            backgroundColor: '#fff',
            cursor: 'pointer',
          }}
          onClick={() => setCurrentTabIndex(2)}
        >
          Tab 3
        </button>
      </div>
      <div style={{ padding: 4 }}>
        Content of Tab {currentTabIndex + 1}
        <br /> <br />
        <button type="button" onClick={() => counterState.increment()}>
          Count: {counterState.count}
        </button>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <CounterStoresProvider>
      <Tabs />
    </CounterStoresProvider>
  )
}
```

## Troubleshooting

TBD
