---
title: 不可变状态和合并
nav: 3
---

与 React 的 `useState` 一样，我们需要不可变地更新状态。

这是一个典型的例子：

```jsx
import { create } from 'zustand'

const useCountStore = create((set) => ({
  count: 0,
  inc: () => set((state) => ({ count: state.count + 1 })),
}))
```


`set` 的功能是更新 store 中的状态。因为状态是不可变的，所以它应该是这样的：

```js
set((state) => ({ ...state, count: state.count + 1 }))
```

然而，由于这是一种常见的模式，`set` 实际上合并了状态，我们可以跳过 `...state` 部分：

```js
set((state) => ({ count: state.count + 1 }))
```

## 嵌套对象

`set` 函数仅合并一层状态。如果您有嵌套对象，则需要显式合并它们。您将像这样使用扩展运算符模式：

```jsx
import { create } from 'zustand'

const useCountStore = create((set) => ({
  nested: { count: 0 },
  inc: () =>
    set((state) => ({
      nested: { ...state.nested, count: state.nested.count + 1 },
    })),
}))
```

对于复杂的用例，请考虑使用一些有助于进行不可变更新的库。您可以参考[更新嵌套状态对象值](./updating-state.md#deeply-nested-object)。

## 更换标志

要禁用合并行为，您可以为 `set` 指定一个`replace`布尔值，如下所示：

```js
set((state) => newState, true)
```
