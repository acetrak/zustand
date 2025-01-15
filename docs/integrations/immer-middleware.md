---
title: Immer 中间件
nav: 18
---

[Immer](https://github.com/immerjs/immer) 中间件使您能够以更方便的方式使用不可变状态。此外，使用 Immer，您可以简化 Zustand 中不可变数据结构的处理。

## 安装

为了在 Zustand 中使用 Immer 中间件，您需要将 Immer 作为直接依赖项安装。

```bash
npm install immer
```

## 使用

（请注意 [Typescript指南](../guides/typescript.md)中提到的类型参数后面的额外括号）。

更新简单状态

```ts
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

type State = {
  count: number
}

type Actions = {
  increment: (qty: number) => void
  decrement: (qty: number) => void
}

export const useCountStore = create<State & Actions>()(
  immer((set) => ({
    count: 0,
    increment: (qty: number) =>
      set((state) => {
        state.count += qty
      }),
    decrement: (qty: number) =>
      set((state) => {
        state.count -= qty
      }),
  })),
)
```

更新复杂状态

```ts
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

interface Todo {
  id: string
  title: string
  done: boolean
}

type State = {
  todos: Record<string, Todo>
}

type Actions = {
  toggleTodo: (todoId: string) => void
}

export const useTodoStore = create<State & Actions>()(
  immer((set) => ({
    todos: {
      '82471c5f-4207-4b1d-abcb-b98547e01a3e': {
        id: '82471c5f-4207-4b1d-abcb-b98547e01a3e',
        title: 'Learn Zustand',
        done: false,
      },
      '354ee16c-bfdd-44d3-afa9-e93679bda367': {
        id: '354ee16c-bfdd-44d3-afa9-e93679bda367',
        title: 'Learn Jotai',
        done: false,
      },
      '771c85c5-46ea-4a11-8fed-36cc2c7be344': {
        id: '771c85c5-46ea-4a11-8fed-36cc2c7be344',
        title: 'Learn Valtio',
        done: false,
      },
      '363a4bac-083f-47f7-a0a2-aeeee153a99c': {
        id: '363a4bac-083f-47f7-a0a2-aeeee153a99c',
        title: 'Learn Signals',
        done: false,
      },
    },
    toggleTodo: (todoId: string) =>
      set((state) => {
        state.todos[todoId].done = !state.todos[todoId].done
      }),
  })),
)
```

## 陷阱

在本节中，您将发现使用 Zustand 与 Immer 时需要记住的一些事项。

### 我的订阅未被调用

如果您正在使用 Immer，请确保您确实遵守 [Immer 规则](https://immerjs.github.io/immer/pitfalls)。

例如，您必须添加 `[immerable] = true` 才能使[class objects](https://immerjs.github.io/immer/complex-objects)正常工作。如果不这样做，Immer 仍然会改变对象，但不会作为代理，因此它也会更新当前状态。 Zustand 检查状态是否实际上已更改，因此由于当前状态和下一个状态相等（如果您没有正确执行），Zustand 将跳过调用订阅。

## CodeSandbox Demo

- [Basic](https://codesandbox.io/p/sandbox/zustand-updating-draft-states-basic-demo-forked-96mkdw),
- [Advanced](https://codesandbox.io/p/sandbox/zustand-updating-draft-states-advanced-demo-forked-phkzzg).
