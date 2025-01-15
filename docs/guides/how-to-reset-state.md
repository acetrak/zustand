---
title: 如何重置状态
nav: 12
---

以下模式可用于将状态重置为其初始值。

```ts
import { create } from 'zustand'

// 分别定义状态值和动作的类型
type State = {
  salmon: number
  tuna: number
}

type Actions = {
  addSalmon: (qty: number) => void
  addTuna: (qty: number) => void
  reset: () => void
}

// define the initial state
const initialState: State = {
  salmon: 0,
  tuna: 0,
}

// create store
const useSlice = create<State & Actions>()((set, get) => ({
  ...initialState,
  addSalmon: (qty: number) => {
    set({ salmon: get().salmon + qty })
  },
  addTuna: (qty: number) => {
    set({ tuna: get().tuna + qty })
  },
  reset: () => {
    set(initialState)
  },
}))
```

一次重置多个stores

```ts
import type { StateCreator } from 'zustand'
import { create: actualCreate } from 'zustand'

const storeResetFns = new Set<() => void>()

const resetAllStores = () => {
  storeResetFns.forEach((resetFn) => {
    resetFn()
  })
}

export const create = (<T>() => {
  return (stateCreator: StateCreator<T>) => {
    const store = actualCreate(stateCreator)
    const initialState = store.getInitialState()
    storeResetFns.add(() => {
      store.setState(initialState, true)
    })
    return store
  }
}) as typeof actualCreate
```

## CodeSandbox Demo

- Basic: https://codesandbox.io/s/zustand-how-to-reset-state-basic-demo-rrqyon
- Advanced: https://codesandbox.io/s/zustand-how-to-reset-state-advanced-demo-gtu0qe
- Immer: https://codesandbox.io/s/how-to-reset-state-advance-immer-demo-nyet3f
