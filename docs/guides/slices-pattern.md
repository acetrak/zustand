---
title: 切片模式
nav: 14
---

## 将商店分割成更小的商店

随着您添加更多功能，您的商店会变得越来越大，也越来越难以维护。

您可以将主商店划分为较小的单独商店以实现模块化。这在 Zustand 中很容易完成！

第一个store:

```js
export const createFishSlice = (set) => ({
  fishes: 0,
  addFish: () => set((state) => ({ fishes: state.fishes + 1 })),
})
```

另一个store:

```js
export const createBearSlice = (set) => ({
  bears: 0,
  addBear: () => set((state) => ({ bears: state.bears + 1 })),
  eatFish: () => set((state) => ({ fishes: state.fishes - 1 })),
})
```

您现在可以将两个商店合并为**一个store**：

```js
import { create } from 'zustand'
import { createBearSlice } from './bearSlice'
import { createFishSlice } from './fishSlice'

export const useBoundStore = create((...a) => ({
  ...createBearSlice(...a),
  ...createFishSlice(...a),
}))
```

### 在React组件中的用法

```jsx
import { useBoundStore } from './stores/useBoundStore'

function App() {
  const bears = useBoundStore((state) => state.bears)
  const fishes = useBoundStore((state) => state.fishes)
  const addBear = useBoundStore((state) => state.addBear)
  return (
    <div>
      <h2>Number of bears: {bears}</h2>
      <h2>Number of fishes: {fishes}</h2>
      <button onClick={() => addBear()}>Add a bear</button>
    </div>
  )
}

export default App
```

### 更新多个stores

您可以在一个函数中同时更新多个商店

```js
export const createBearFishSlice = (set, get) => ({
  addBearAndFish: () => {
    get().addBear()
    get().addFish()
  },
})
```

和之前一样将所有stores合并在一起

```js
import { create } from 'zustand'
import { createBearSlice } from './bearSlice'
import { createFishSlice } from './fishSlice'
import { createBearFishSlice } from './createBearFishSlice'

export const useBoundStore = create((...a) => ({
  ...createBearSlice(...a),
  ...createFishSlice(...a),
  ...createBearFishSlice(...a),
}))
```

## 添加中间件

向组合存储添加中间件与其他普通存储相同。

将`persist`中间件添加到我们的 `useBoundStore` 中:

```js
import { create } from 'zustand'
import { createBearSlice } from './bearSlice'
import { createFishSlice } from './fishSlice'
import { persist } from 'zustand/middleware'

export const useBoundStore = create(
  persist(
    (...a) => ({
      ...createBearSlice(...a),
      ...createFishSlice(...a),
    }),
    { name: 'bound-store' },
  ),
)
```

请记住，您应该只在组合商店中应用中间件。将它们应用到各个切片内可能会导致意想不到的问题。

## 与TypeScript一起使用

有关如何通过 TypeScript 在 Zustand 中使用切片模式的详细指南可以在[此处](./typescript.md#slices-pattern)找到。