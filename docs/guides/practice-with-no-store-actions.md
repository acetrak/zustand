---
title: 无store actons的练习
nav: 6
---

建议的用法是在商店内并置操作和状态（让您的操作与状态一起定位）

例如：

```js
export const useBoundStore = create((set) => ({
  count: 0,
  text: 'hello',
  inc: () => set((state) => ({ count: state.count + 1 })),
  setText: (text) => set({ text }),
}))
```

这将创建一个包含数据和操作的独立存储。

---

另一种方法是在商店外部的模块级别定义操作。

```js
export const useBoundStore = create(() => ({
  count: 0,
  text: 'hello',
}))

export const inc = () =>
  useBoundStore.setState((state) => ({ count: state.count + 1 }))

export const setText = (text) => useBoundStore.setState({ text })
```

这有几个优点：

- 它不需要hook来调用操作
- 它有利于代码分割。

虽然这种模式没有任何缺点，但由于其封装性质，有些人可能更喜欢并置。