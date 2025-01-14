---
title: 简介
description: 如何使用 Zustand
nav: 0
---

![Logo Zustand](./bear.jpg)

一个小型、快速且可扩展的 Bearbones 状态管理解决方案。 Zustand 有一个基于 hooks 的舒适 API。它不是样板文件或固执己见，但有足够的惯例来明确和类似通量。


不要因为它很可爱而忽视它，它有爪子！我们花费了大量时间来处理常见的陷阱，例如可怕的[僵尸子问题]、[React并发性]以及混合渲染器之间的[上下文丢失]。它可能是 React 领域中唯一能实现所有这些功能的状态管理器。

您可以在这里尝试[演示](https://codesandbox.io/s/dazzling-moon-itop4).

[僵尸子问题]: https://react-redux.js.org/api/hooks#stale-props-and-zombie-children
[React并发性]: https://github.com/bvaughn/rfcs/blob/useMutableSource/text/0000-use-mutable-source.md
[上下文丢失]: https://github.com/facebook/react/issues/13332

## 安装

Zustand 可作为 NPM 上的软件包使用：

```bash
# NPM
npm install zustand
# Or, use any package manager of your choice.
```

## 首先创建一个store

你的store是一个钩子！您可以在其中放入任何内容：原语、对象、函数。
`set` 函数合并状态

```js
import { create } from 'zustand'

const useStore = create((set) => ({
  bears: 0,
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  removeAllBears: () => set({ bears: 0 }),
  updateBears: (newBears) => set({ bears: newBears }),
}))
```

## 然后绑定您的组件，就这样！​

您可以在任何地方使用该钩子，而不需要提供者。选择您的状态，当该状态发生变化时，使用组件将重新渲染

```jsx
function BearCounter() {
  const bears = useStore((state) => state.bears)
  return <h1>{bears} around here...</h1>
}

function Controls() {
  const increasePopulation = useStore((state) => state.increasePopulation)
  return <button onClick={increasePopulation}>one up</button>
}
```
