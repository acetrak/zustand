---
title: Map 和 Set 的使用
nav: 10
---

您需要将映射和集合包装在对象内。当您希望反映其更新时（例如在 React 中），您可以通过调用 · 来实现：

**您可以在此处查看codesandbox: https://codesandbox.io/s/late-https-bxz9qy**

```js
import { create } from 'zustand'

const useFooBar = create(() => ({ foo: new Map(), bar: new Set() }))

function doSomething() {
  // doing something...

  // 如果你想更新一些使用 `useFooBar` 的 React 组件，你必须调用 setState
  // 让 React 知道更新发生了。
  // 遵循 React 的最佳实践，您应该在更新它们时创建一个新的 Map/Set
  useFooBar.setState((prev) => ({
    foo: new Map(prev.foo).set('newKey', 'newValue'),
    bar: new Set(prev.bar).add('newKey'),
  }))
}
```
