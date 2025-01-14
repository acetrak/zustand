---
title: 对比
description: Zustand与其它库相比
nav: 1
---

Zustand 是 React 的众多状态管理库之一。在本页中，我们将讨论 Zustand 与其中一些库的比较，包括 Redux、Valtio、Jotai 和 Recoil。

每个库都有自己的优点和缺点，我们将比较每个库之间的主要差异和相似之处。

## Redux

### 状态模型 (vs Redux)

从概念上讲，Zustand 和 Redux 非常相似，都基于不可变状态模型。但是，Redux 要求您的应用程序包装在上下文提供程序中；祖斯坦没有。

**Zustand**

```ts
import { create } from 'zustand'

type State = {
  count: number
}

type Actions = {
  increment: (qty: number) => void
  decrement: (qty: number) => void
}

const useCountStore = create<State & Actions>((set) => ({
  count: 0,
  increment: (qty: number) => set((state) => ({ count: state.count + qty })),
  decrement: (qty: number) => set((state) => ({ count: state.count - qty })),
}))
```

```ts
import { create } from 'zustand'

type State = {
  count: number
}

type Actions = {
  increment: (qty: number) => void
  decrement: (qty: number) => void
}

type Action = {
  type: keyof Actions
  qty: number
}

const countReducer = (state: State, action: Action) => {
  switch (action.type) {
    case 'increment':
      return { count: state.count + action.qty }
    case 'decrement':
      return { count: state.count - action.qty }
    default:
      return state
  }
}

const useCountStore = create<State & Actions>((set) => ({
  count: 0,
  dispatch: (action: Action) => set((state) => countReducer(state, action)),
}))
```

**Redux**

```ts
import { createStore } from 'redux'
import { useSelector, useDispatch } from 'react-redux'

type State = {
  count: number
}

type Action = {
  type: 'increment' | 'decrement'
  qty: number
}

const countReducer = (state: State, action: Action) => {
  switch (action.type) {
    case 'increment':
      return { count: state.count + action.qty }
    case 'decrement':
      return { count: state.count - action.qty }
    default:
      return state
  }
}

const countStore = createStore(countReducer)
```

```ts
import { createSlice, configureStore } from '@reduxjs/toolkit'

const countSlice = createSlice({
  name: 'count',
  initialState: { value: 0 },
  reducers: {
    incremented: (state, qty: number) => {
      // Redux Toolkit does not mutate the state, it uses the Immer library
      // behind scenes, allowing us to have something called "draft state".
      state.value += qty
    },
    decremented: (state, qty: number) => {
      state.value -= qty
    },
  },
})

const countStore = configureStore({ reducer: countSlice.reducer })
```

### 渲染优化 (vs Redux)

当谈到应用程序内的渲染优化时，Zustand 和 Redux 之间的方法没有重大差异。在这两个库中，建议您使用选择器手动应用渲染优化。

**Zustand**

```ts
import { create } from 'zustand'

type State = {
  count: number
}

type Actions = {
  increment: (qty: number) => void
  decrement: (qty: number) => void
}

const useCountStore = create<State & Actions>((set) => ({
  count: 0,
  increment: (qty: number) => set((state) => ({ count: state.count + qty })),
  decrement: (qty: number) => set((state) => ({ count: state.count - qty })),
}))

const Component = () => {
  const count = useCountStore((state) => state.count)
  const increment = useCountStore((state) => state.increment)
  const decrement = useCountStore((state) => state.decrement)
  // ...
}
```

**Redux**

```ts
import { createStore } from 'redux'
import { useSelector, useDispatch } from 'react-redux'

type State = {
  count: number
}

type Action = {
  type: 'increment' | 'decrement'
  qty: number
}

const countReducer = (state: State, action: Action) => {
  switch (action.type) {
    case 'increment':
      return { count: state.count + action.qty }
    case 'decrement':
      return { count: state.count - action.qty }
    default:
      return state
  }
}

const countStore = createStore(countReducer)

const Component = () => {
  const count = useSelector((state) => state.count)
  const dispatch = useDispatch()
  // ...
}
```

```ts
import { useSelector } from 'react-redux'
import type { TypedUseSelectorHook } from 'react-redux'
import { createSlice, configureStore } from '@reduxjs/toolkit'

const countSlice = createSlice({
  name: 'count',
  initialState: { value: 0 },
  reducers: {
    incremented: (state, qty: number) => {
      // Redux Toolkit does not mutate the state, it uses the Immer library
      // behind scenes, allowing us to have something called "draft state".
      state.value += qty
    },
    decremented: (state, qty: number) => {
      state.value -= qty
    },
  },
})

const countStore = configureStore({ reducer: countSlice.reducer })

const useAppSelector: TypedUseSelectorHook<typeof countStore.getState> =
  useSelector

const useAppDispatch: () => typeof countStore.dispatch = useDispatch

const Component = () => {
  const count = useAppSelector((state) => state.count.value)
  const dispatch = useAppDispatch()
  // ...
}
```

## Valtio

### 状态模型 (vs Valtio)

Zustand 和 Valtio 以完全不同的方式进行状态管理。 Zustand基于不可变状态模型，而Valtio基于可变状态模型。

**Zustand**

```ts
import { create } from 'zustand'

type State = {
  obj: { count: number }
}

const store = create<State>(() => ({ obj: { count: 0 } }))

store.setState((prev) => ({ obj: { count: prev.obj.count + 1 } }))
```

**Valtio**

```ts
import { proxy } from 'valtio'

const state = proxy({ obj: { count: 0 } })

state.obj.count += 1
```

### 渲染优化 (vs Valtio)

Zustand 和 Valtio 之间的另一个区别是 Valtio 通过属性访问进行渲染优化。但是，对于 Zustand，建议您使用选择器手动应用渲染优化。

**Zustand**

```ts
import { create } from 'zustand'

type State = {
  count: number
}

const useCountStore = create<State>(() => ({
  count: 0,
}))

const Component = () => {
  const count = useCountStore((state) => state.count)
  // ...
}
```

**Valtio**

```ts
import { proxy, useSnapshot } from 'valtio'

const state = proxy({
  count: 0,
})

const Component = () => {
  const { count } = useSnapshot(state)
  // ...
}
```

## Jotai

### 状态模型 (vs Jotai)

Zustand 和 Jotai 之间有一个主要区别。 Zustand 是一个单一的存储，而 Jotai 由可以组合在一起的原始原子组成。

**Zustand**

```ts
import { create } from 'zustand'

type State = {
  count: number
}

type Actions = {
  updateCount: (
    countCallback: (count: State['count']) => State['count'],
  ) => void
}

const useCountStore = create<State & Actions>((set) => ({
  count: 0,
  updateCount: (countCallback) =>
    set((state) => ({ count: countCallback(state.count) })),
}))
```

**Jotai**

```ts
import { atom } from 'jotai'

const countAtom = atom<number>(0)
```

### 渲染优化 (vs Jotai)

Jotai通过原子依赖实现渲染优化。但是，对于 Zustand，建议您使用选择器手动应用渲染优化。

**Zustand**

```ts
import { create } from 'zustand'

type State = {
  count: number
}

type Actions = {
  updateCount: (
    countCallback: (count: State['count']) => State['count'],
  ) => void
}

const useCountStore = create<State & Actions>((set) => ({
  count: 0,
  updateCount: (countCallback) =>
    set((state) => ({ count: countCallback(state.count) })),
}))

const Component = () => {
  const count = useCountStore((state) => state.count)
  const updateCount = useCountStore((state) => state.updateCount)
  // ...
}
```

**Jotai**

```ts
import { atom, useAtom } from 'jotai'

const countAtom = atom<number>(0)

const Component = () => {
  const [count, updateCount] = useAtom(countAtom)
  // ...
}
```

## Recoil

### 状态模型 (vs Recoil)

Zustand 和 Recoil 之间的区别类似于 Zustand 和 Jotai 之间的区别。 Recoil 取决于原子字符串键而不是原子对象引用标识。此外，Recoil 需要将您的应用程序包装在上下文提供程序中。

**Zustand**

```ts
import { create } from 'zustand'

type State = {
  count: number
}

type Actions = {
  setCount: (countCallback: (count: State['count']) => State['count']) => void
}

const useCountStore = create<State & Actions>((set) => ({
  count: 0,
  setCount: (countCallback) =>
    set((state) => ({ count: countCallback(state.count) })),
}))
```

**Recoil**

```ts
import { atom } from 'recoil'

const count = atom({
  key: 'count',
  default: 0,
})
```

### 渲染优化 (vs Recoil)

与之前的优化比较类似，Recoil 通过原子依赖来进行渲染优化。而使用 Zustand，建议您使用选择器手动应用渲染优化。

**Zustand**

```ts
import { create } from 'zustand'

type State = {
  count: number
}

type Actions = {
  setCount: (countCallback: (count: State['count']) => State['count']) => void
}

const useCountStore = create<State & Actions>((set) => ({
  count: 0,
  setCount: (countCallback) =>
    set((state) => ({ count: countCallback(state.count) })),
}))

const Component = () => {
  const count = useCountStore((state) => state.count)
  const setCount = useCountStore((state) => state.setCount)
  // ...
}
```

**Recoil**

```ts
import { atom, useRecoilState } from 'recoil'

const countAtom = atom({
  key: 'count',
  default: 0,
})

const Component = () => {
  const [count, setCount] = useRecoilState(countAtom)
  // ...
}
```

## Npm 下载趋势​

- [React 状态管理库 Npm 下载趋势](https://npm-stat.com/charts.html?package=zustand&package=jotai&package=valtio&package=%40reduxjs%2Ftoolkit&package=recoil)
