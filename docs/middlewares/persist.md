---
title: persist
description: 如何持久化store
nav: 207
---

# persist

`persist` 中间件允许您在页面重新加载或应用程序重新启动时保留存储的状态。

```js
const nextStateCreatorFn = persist(stateCreatorFn, persistOptions)
```

## 类型

### 签名

```ts
persist<T, U>(stateCreatorFn: StateCreator<T, [], []>, persistOptions?: PersistOptions<T, U>): StateCreator<T, [['zustand/persist', U]], []>
```

### 突变体

<!-- prettier-ignore-start -->
```ts
['zustand/persist', U]
```
<!-- prettier-ignore-end -->

## 语法

### `persist(stateCreatorFn)`

#### 参数

- `stateCreatorFn`: 一个以 `set` 函数、`get` 函数和 `store` 作为参数的函数。通常，您将返回一个带有您想要公开的方法的对象。
- `persistOptions`: 用于定义存储选项的对象。
  - `name`: 您的store在存储中的项目的唯一名称。
  - **可选** `storage`: 默认为`createJSONStorage(() => localStorage)`。
  - **可选** `partialize`: 在保留状态字段之前过滤状态字段的函数。
  - **可选** `onRehydrateStorage`:一个函数或返回一个函数，允许在状态补水之前和之后自定义逻辑。
  - **可选** `version`: 持久状态的版本号。如果存储的状态版本不匹配，则不会使用它。
  - **可选** `migrate`: 如果发生版本不匹配，则迁移持久状态的函数。
  - **可选** `merge`: 在重新水合期间将持久状态与当前状态合并时用于自定义逻辑的函数。默认为浅合并。
  - **可选** `skipHydration`: 默认为 `false`。如果为 `true`，中间件不会在初始化时自动`rehydrate`状态。在这种情况下，请手动使用补水功能。这对于服务器端渲染 (SSR) 应用程序非常有用。

#### 返回

`persist` 返回一个状态创建器函数。

## 适应

### 持久化状态

在本教程中，我们将使用普通存储和`persist`中间件创建一个简单的位置跟踪器。该示例跟踪鼠标在容器内移动时的位置，并将该位置存储在本地存储中，因此即使页面重新加载，它也会保留。

我们首先设置一个普通存储来保存位置（具有 `x` 和 `y` 坐标的对象）和更新它的操作。我们还将使用 `persist`中间件将位置存储在 `localStorage` 中。

```ts
import { createStore } from 'zustand/vanilla'
import { persist } from 'zustand/middleware'

type PositionStoreState = { position: { x: number; y: number } }

type PositionStoreActions = {
  setPosition: (nextPosition: PositionStoreState['position']) => void
}

type PositionStore = PositionStoreState & PositionStoreActions

const positionStore = createStore<PositionStore>()(
  persist(
    (set) => ({
      position: { x: 0, y: 0 },
      setPosition: (position) => set({ position }),
    }),
    { name: 'position-storage' },
  ),
)
```

接下来，我们将跟踪 div 内的鼠标移动并使用新位置更新存储。

```ts
const $dotContainer = document.getElementById('dot-container') as HTMLDivElement
const $dot = document.getElementById('dot') as HTMLDivElement

$dotContainer.addEventListener('pointermove', (event) => {
  positionStore.getState().setPosition({
    x: event.clientX,
    y: event.clientY,
  })
})
```

我们希望通过将 div 元素（代表点）移动到新坐标来反映屏幕上的位置更新。

```ts
const render: Parameters<typeof positionStore.subscribe>[0] = (state) => {
  $dot.style.transform = `translate(${state.position.x}px, ${state.position.y}px)`
}

render(positionStore.getState(), positionStore.getState())

positionStore.subscribe(render)
```

这是完整的代码。

```ts
import { createStore } from 'zustand/vanilla'
import { persist } from 'zustand/middleware'

type PositionStoreState = { position: { x: number; y: number } }

type PositionStoreActions = {
  setPosition: (nextPosition: PositionStoreState['position']) => void
}

type PositionStore = PositionStoreState & PositionStoreActions

const positionStore = createStore<PositionStore>()(
  persist(
    (set) => ({
      position: { x: 0, y: 0 },
      setPosition: (position) => set({ position }),
    }),
    { name: 'position-storage' },
  ),
)

const $dotContainer = document.getElementById('dot-container') as HTMLDivElement
const $dot = document.getElementById('dot') as HTMLDivElement

$dotContainer.addEventListener('pointermove', (event) => {
  positionStore.getState().setPosition({
    x: event.clientX,
    y: event.clientY,
  })
})

const render: Parameters<typeof positionStore.subscribe>[0] = (state) => {
  $dot.style.transform = `translate(${state.position.x}px, ${state.position.y}px)`
}

render(positionStore.getState(), positionStore.getState())

positionStore.subscribe(render)
```

这是html代码

```html
<div
  id="dot-container"
  style="position: relative; width: 100vw; height: 100vh;"
>
  <div
    id="dot"
    style="position: absolute; background-color: red; border-radius: 50%; left: -10px; top: -10px; width: 20px; height: 20px;"
  ></div>
</div>
```

### 部分保留状态

在本教程中，我们将使用普通存储和`persist`中间件创建一个简单的位置跟踪器。此外，我们将向您展示如何仅持久化部分状态（部分持久化），当您不想将整个状态存储在 `localStorage` 中时，这会很有用。

我们将首先创建一个普通存储来保存位置状态和更新它的操作。我们将使用`persist`中间件来仅保留状态的相关部分（在本例中为包含位置的上下文）。

```ts
import { createStore } from 'zustand/vanilla'
import { persist } from 'zustand/middleware'

type PositionStoreState = {
  context: {
    position: { x: number; y: number }
  }
}

type PositionStoreActions = {
  actions: {
    setPosition: (
      nextPosition: PositionStoreState['context']['position'],
    ) => void
  }
}

type PositionStore = PositionStoreState & PositionStoreActions

const positionStore = createStore<PositionStore>()(
  persist(
    (set) => ({
      context: {
        position: { x: 0, y: 0 },
      },
      actions: {
        setPosition: (position) => set({ context: { position } }),
      },
    }),
    {
      name: 'position-storage',
      partialize: (state) => ({ context: state.context }),
    },
  ),
)
```

接下来，我们将跟踪 div 内的鼠标移动并使用新位置更新存储。

```ts
const $dotContainer = document.getElementById('dot-container') as HTMLDivElement
const $dot = document.getElementById('dot') as HTMLDivElement

$dotContainer.addEventListener('pointermove', (event) => {
  positionStore.getState().actions.setPosition({
    x: event.clientX,
    y: event.clientY,
  })
})
```

我们希望通过将 div 元素（代表点）移动到新坐标来反映屏幕上的位置更新。

```ts
const render: Parameters<typeof positionStore.subscribe>[0] = (state) => {
  $dot.style.transform = `translate(${state.context.position.x}px, ${state.context.position.y}px)`
}

render(positionStore.getState(), positionStore.getState())

positionStore.subscribe(render)
```

以下是创建一个点的完整代码，该点跟随鼠标在容器内的移动并将上下文保留在 `localStorage` 中。

```ts
import { createStore } from 'zustand/vanilla'
import { persist } from 'zustand/middleware'

type PositionStoreState = {
  context: {
    position: { x: number; y: number }
  }
}

type PositionStoreActions = {
  actions: {
    setPosition: (
      nextPosition: PositionStoreState['context']['position'],
    ) => void
  }
}

type PositionStore = PositionStoreState & PositionStoreActions

const positionStore = createStore<PositionStore>()(
  persist(
    (set) => ({
      context: {
        position: { x: 0, y: 0 },
      },
      actions: {
        setPosition: (position) => set({ context: { position } }),
      },
    }),
    {
      name: 'position-storage',
      partialize: (state) => ({ context: state.context }),
    },
  ),
)

const $dotContainer = document.getElementById('dot-container') as HTMLDivElement
const $dot = document.getElementById('dot') as HTMLDivElement

$dotContainer.addEventListener('pointermove', (event) => {
  positionStore.getState().actions.setPosition({
    x: event.clientX,
    y: event.clientY,
  })
})

const render: Parameters<typeof positionStore.subscribe>[0] = (state) => {
  $dot.style.transform = `translate(${state.context.position.x}px, ${state.context.position.y}px)`
}

render(positionStore.getState(), positionStore.getState())

positionStore.subscribe(render)
```

这是html代码

```html
<div
  id="dot-container"
  style="position: relative; width: 100vw; height: 100vh;"
>
  <div
    id="dot"
    style="position: absolute; background-color: red; border-radius: 50%; left: -10px; top: -10px; width: 20px; height: 20px;"
  ></div>
</div>
```

### 使用自定义存储保持状态

在这个迷你教程中，我们将使用 vanilla store 创建一个简单的位置跟踪系统，其中位置状态保留在 URL 的搜索参数中。这种方法允许直接在浏览器的 URL 中保留状态，这对于跨页面重新加载维护状态或共享嵌入状态的链接非常有用。

我们需要实现函数来操作 URL 搜索参数，就好像它们是一种存储机制一样。这包括检索、设置和删除参数。

```ts
const getSearchParams = () => {
  return new URL(location.href).searchParams
}

const updateSearchParams = (searchParams: URLSearchParams) => {
  window.history.replaceState(
    {},
    '',
    `${location.pathname}?${searchParams.toString()}`,
  )
}

const getSearchParam = (key: string) => {
  const searchParams = getSearchParams()
  return searchParams.get(key)
}

const updateSearchParam = (key: string, value: string) => {
  const searchParams = getSearchParams()
  searchParams.set(key, value)

  updateSearchParams(searchParams)
}

const removeSearchParam = (key: string) => {
  const searchParams = getSearchParams()
  searchParams.delete(key)

  updateSearchParams(searchParams)
}
```

为了使用 URL 搜索参数作为存储，我们定义了一个带有 `getItem`、`setItem` 和 `removeItem`方法的 `searchParamsStorage` 对象。这些方法映射到我们操纵搜索参数的自定义函数。

```ts
const searchParamsStorage = {
  getItem: (key: string) => getSearchParam(key),
  setItem: (key: string, value: string) => updateSearchParam(key, value),
  removeItem: (key: string) => removeSearchParam(key),
}
```

现在，我们使用`persist`中间件初始化普通存储，指定我们要使用自定义存储。我们将在 URL 搜索参数中保留位置数据，而不是默认的 `localStorage` 或 `sessionStorage`。

```ts
import { createStore } from 'zustand/vanilla'
import { persist, createJSONStorage } from 'zustand/middleware'

type PositionStoreState = { position: { x: number; y: number } }

type PositionStoreActions = {
  setPosition: (nextPosition: PositionStoreState['position']) => void
}

type PositionStore = PositionStoreState & PositionStoreActions

const positionStore = createStore<PositionStore>()(
  persist(
    (set) => ({
      position: { x: 0, y: 0 },
      setPosition: (position) => set({ position }),
    }),
    {
      name: 'position-storage',
      storage: createJSONStorage(() => searchParamsStorage),
    },
  ),
)
```

接下来，我们将跟踪 div 内的鼠标移动并使用新位置更新存储。

```ts
const $dotContainer = document.getElementById('dot-container') as HTMLDivElement
const $dot = document.getElementById('dot') as HTMLDivElement

$dotContainer.addEventListener('pointermove', (event) => {
  positionStore.getState().setPosition({
    x: event.clientX,
    y: event.clientY,
  })
})
```

我们希望通过将 div 元素（代表点）移动到新坐标来反映屏幕上的位置更新。

```ts
const render: Parameters<typeof positionStore.subscribe>[0] = (state) => {
  $dot.style.transform = `translate(${state.position.x}px, ${state.position.y}px)`
}

render(positionStore.getState(), positionStore.getState())

positionStore.subscribe(render)
```

下面是创建一个点的完整代码，该点跟随鼠标在容器内的移动并保留 URL 搜索参数中的位置。

```ts
import { createStore } from 'zustand/vanilla'
import { persist, createJSONStorage } from 'zustand/middleware'

type PositionStoreState = { position: { x: number; y: number } }

type PositionStoreActions = {
  setPosition: (nextPosition: PositionStoreState['position']) => void
}

type PositionStore = PositionStoreState & PositionStoreActions

const getSearchParams = () => {
  return new URL(location.href).searchParams
}

const updateSearchParams = (searchParams: URLSearchParams) => {
  window.history.replaceState(
    {},
    '',
    `${location.pathname}?${searchParams.toString()}`,
  )
}

const getSearchParam = (key: string) => {
  const searchParams = getSearchParams()
  return searchParams.get(key)
}

const updateSearchParam = (key: string, value: string) => {
  const searchParams = getSearchParams()
  searchParams.set(key, value)

  updateSearchParams(searchParams)
}

const removeSearchParam = (key: string) => {
  const searchParams = getSearchParams()
  searchParams.delete(key)

  updateSearchParams(searchParams)
}

const searchParamsStorage = {
  getItem: (key: string) => getSearchParam(key),
  setItem: (key: string, value: string) => updateSearchParam(key, value),
  removeItem: (key: string) => removeSearchParam(key),
}

const positionStore = createStore<PositionStore>()(
  persist(
    (set) => ({
      position: { x: 0, y: 0 },
      setPosition: (position) => set({ position }),
    }),
    {
      name: 'position-storage',
      storage: createJSONStorage(() => searchParamsStorage),
    },
  ),
)

const $dotContainer = document.getElementById('dot-container') as HTMLDivElement
const $dot = document.getElementById('dot') as HTMLDivElement

$dotContainer.addEventListener('pointermove', (event) => {
  positionStore.getState().setPosition({
    x: event.clientX,
    y: event.clientY,
  })
})

const render: Parameters<typeof positionStore.subscribe>[0] = (state) => {
  $dot.style.transform = `translate(${state.position.x}px, ${state.position.y}px)`
}

render(positionStore.getState(), positionStore.getState())

positionStore.subscribe(render)
```

这是html代码

```html
<div
  id="dot-container"
  style="position: relative; width: 100vw; height: 100vh;"
>
  <div
    id="dot"
    style="position: absolute; background-color: red; border-radius: 50%; left: -10px; top: -10px; width: 20px; height: 20px;"
  ></div>
</div>
```

### 通过版本控制和迁移来保持状态

在本教程中，我们将探索如何使用版本控制和迁移来管理状态持久性。我们将演示如何在不破坏现有持久数据的情况下跨版本发展您的状态模式。

在转向版本化状态管理之前，我们模拟版本 0 的初始状态。这是通过在 `localStorage` 中手动设置版本 0 状态（如果尚不存在）来完成的。版本 0 状态将坐标保存为 `x` 和 `y` 字段。

```ts
// For tutorial purposes only
if (!localStorage.getItem('position-storage')) {
  localStorage.setItem(
    'position-storage',
    JSON.stringify({
      state: { x: 100, y: 100 }, // version 0 structure
      version: 0,
    }),
  )
}
```

接下来，我们使用 `persist`中间件来处理状态持久化。我们还添加了 `migrate`功能来处理版本之间的更改。在此示例中，我们将状态从版本 0（其中 `x` 和 `y` 独立）迁移到版本 1，在版本 1 中它们组合成一个`position`对象。

```ts
migrate: (persisted: any, version) => {
  if (version === 0) {
    persisted.position = { x: persisted.x, y: persisted.y }
    delete persisted.x
    delete persisted.y
  }

  return persisted
}
```

接下来，我们将跟踪 div 内的鼠标移动并使用新位置更新存储。

```ts
const $dotContainer = document.getElementById('dot-container') as HTMLDivElement
const $dot = document.getElementById('dot') as HTMLDivElement

$dotContainer.addEventListener('pointermove', (event) => {
  positionStore.getState().setPosition({
    x: event.clientX,
    y: event.clientY,
  })
})
```

我们希望通过将 div 元素（代表点）移动到新坐标来反映屏幕上的位置更新。

```ts
const render: Parameters<typeof positionStore.subscribe>[0] = (state) => {
  $dot.style.transform = `translate(${state.position.x}px, ${state.position.y}px)`
}

render(positionStore.getState(), positionStore.getState())

positionStore.subscribe(render)
```

这是完整的代码。

```ts
import { createStore } from 'zustand/vanilla'
import { persist } from 'zustand/middleware'

// For tutorial purposes only
if (!localStorage.getItem('position-storage')) {
  localStorage.setItem(
    'position-storage',
    JSON.stringify({
      state: { x: 100, y: 100 },
      version: 0,
    }),
  )
}

type PositionStoreState = { position: { x: number; y: number } }

type PositionStoreActions = {
  setPosition: (nextPosition: PositionStoreState['position']) => void
}

type PositionStore = PositionStoreState & PositionStoreActions

const positionStore = createStore<PositionStore>()(
  persist(
    (set) => ({
      position: { x: 0, y: 0 }, // version 0: just x: 0, y: 0
      setPosition: (position) => set({ position }),
    }),
    {
      name: 'position-storage',
      version: 1,
      migrate: (persisted: any, version) => {
        if (version === 0) {
          persisted.position = { x: persisted.x, y: persisted.y }
          delete persisted.x
          delete persisted.y
        }

        return persisted
      },
    },
  ),
)

const $dotContainer = document.getElementById('dot-container') as HTMLDivElement
const $dot = document.getElementById('dot') as HTMLDivElement

$dotContainer.addEventListener('pointermove', (event) => {
  positionStore.getState().setPosition({
    x: event.clientX,
    y: event.clientY,
  })
})

const render: Parameters<typeof positionStore.subscribe>[0] = (state) => {
  $dot.style.transform = `translate(${state.position.x}px, ${state.position.y}px)`
}

render(positionStore.getState(), positionStore.getState())

positionStore.subscribe(render)
```

这是`html`代码

```html
<div
  id="dot-container"
  style="position: relative; width: 100vw; height: 100vh;"
>
  <div
    id="dot"
    style="position: absolute; background-color: red; border-radius: 50%; left: -10px; top: -10px; width: 20px; height: 20px;"
  ></div>
</div>
```

### 使用嵌套对象保留状态

在本教程中，我们将创建一个普通存储来跟踪由 `x` 和 `y` 坐标表示的位置。我们还将使用 `localStorage` 实现持久性，并演示如何处理可能丢失字段的状态合并。

为了模拟本教程的初始状态，我们将检查 `localStorage` 中是否存在我们的位置数据。如果没有，我们将进行设置。

```ts
if (!localStorage.getItem('position-storage')) {
  localStorage.setItem(
    'position-storage',
    JSON.stringify({
      state: { position: { y: 100 } }, // missing `x` field
      version: 0,
    }),
  )
}
```

现在，我们将创建存储并将其配置为使用持久性和深度合并。

```ts
import { createStore } from 'zustand/vanilla'
import { persist } from 'zustand/middleware'
import createDeepMerge from '@fastify/deepmerge'

const deepMerge = createDeepMerge({ all: true })

type PositionStoreState = { position: { x: number; y: number } }

type PositionStoreActions = {
  setPosition: (nextPosition: PositionStoreState['position']) => void
}

type PositionStore = PositionStoreState & PositionStoreActions

const positionStore = createStore<PositionStore>()(
  persist(
    (set) => ({
      position: { x: 0, y: 0 },
      setPosition: (position) => set({ position }),
    }),
    {
      name: 'position-storage',
      merge: (persisted, current) => deepMerge(current, persisted) as never,
    },
  ),
)
```

现在，我们将创建存储并将其配置为使用持久性和深度合并。

```ts
const $dotContainer = document.getElementById('dot-container') as HTMLDivElement
const $dot = document.getElementById('dot') as HTMLDivElement

$dotContainer.addEventListener('pointermove', (event) => {
  positionStore.getState().setPosition({
    x: event.clientX,
    y: event.clientY,
  })
})
```

我们希望通过将 div 元素（代表点）移动到新坐标来反映屏幕上的位置更新。

```ts
const render: Parameters<typeof positionStore.subscribe>[0] = (state) => {
  $dot.style.transform = `translate(${state.position.x}px, ${state.position.y}px)`
}

render(positionStore.getState(), positionStore.getState())

positionStore.subscribe(render)
```

这是完整的代码。

```ts
import { createStore } from 'zustand/vanilla'
import { persist } from 'zustand/middleware'
import createDeepMerge from '@fastify/deepmerge'

const deepMerge = createDeepMerge({ all: true })

// For tutorial purposes only
if (!localStorage.getItem('position-storage')) {
  localStorage.setItem(
    'position-storage',
    JSON.stringify({
      state: { position: { y: 100 } }, // missing `x` field
      version: 0,
    }),
  )
}

type PositionStoreState = { position: { x: number; y: number } }

type PositionStoreActions = {
  setPosition: (nextPosition: PositionStoreState['position']) => void
}

type PositionStore = PositionStoreState & PositionStoreActions

const positionStore = createStore<PositionStore>()(
  persist(
    (set) => ({
      position: { x: 0, y: 0 },
      setPosition: (position) => set({ position }),
    }),
    {
      name: 'position-storage',
      merge: (persisted, current) => deepMerge(current, persisted) as never,
    },
  ),
)

const $dotContainer = document.getElementById('dot-container') as HTMLDivElement
const $dot = document.getElementById('dot') as HTMLDivElement

$dotContainer.addEventListener('pointermove', (event) => {
  positionStore.getState().setPosition({
    x: event.clientX,
    y: event.clientY,
  })
})

const render: Parameters<typeof positionStore.subscribe>[0] = (state) => {
  console.log({ state })
  $dot.style.transform = `translate(${state.position.x}px, ${state.position.y}px)`
}

render(positionStore.getState(), positionStore.getState())

positionStore.subscribe(render)
```

这是`html`代码

```html
<div
  id="dot-container"
  style="position: relative; width: 100vw; height: 100vh;"
>
  <div
    id="dot"
    style="position: absolute; background-color: red; border-radius: 50%; left: -10px; top: -10px; width: 20px; height: 20px;"
  ></div>
</div>
```

### 保持状态并手动水合它

在本教程中，我们将创建一个普通存储来跟踪由 `x` 和 `y` 坐标表示的位置。我们还将使用 `localStorage` 实现持久性，并探索如何跳过水合过程并在延迟后手动触发重新水合。

我们首先设置一个普通存储来保存位置（具有 `x` 和 `y` 坐标的对象）和更新它的操作。此外，我们还将使用`persist`中间件将位置存储在 `localStorage` 中，但跳过水化。

```ts
import { createStore } from 'zustand/vanilla'
import { persist } from 'zustand/middleware'

type PositionStoreState = { position: { x: number; y: number } }

type PositionStoreActions = {
  setPosition: (nextPosition: PositionStoreState['position']) => void
}

type PositionStore = PositionStoreState & PositionStoreActions

const positionStore = createStore<PositionStore>()(
  persist(
    (set) => ({
      position: { x: 0, y: 0 },
      setPosition: (position) => set({ position }),
    }),
    {
      name: 'position-storage',
      skipHydration: true,
    },
  ),
)
```

由于我们在初始设置中跳过了水合，因此我们将手动重新水合状态。在这里，我们使用 `setTimeout` 来模拟延迟重新水合。

```ts
setTimeout(() => {
  positionStore.persist.rehydrate()
}, 2000)
```

接下来，我们将跟踪 div 内的鼠标移动并使用新位置更新存储。

```ts
const $dotContainer = document.getElementById('dot-container') as HTMLDivElement
const $dot = document.getElementById('dot') as HTMLDivElement

$dotContainer.addEventListener('pointermove', (event) => {
  positionStore.getState().setPosition({
    x: event.clientX,
    y: event.clientY,
  })
})
```

我们希望通过将 div 元素（代表点）移动到新坐标来反映屏幕上的位置更新。

```ts
const render: Parameters<typeof positionStore.subscribe>[0] = (state) => {
  $dot.style.transform = `translate(${state.position.x}px, ${state.position.y}px)`
}

render(positionStore.getState(), positionStore.getState())

positionStore.subscribe(render)
```

这是完整的代码。

```ts
import { createStore } from 'zustand/vanilla'
import { persist } from 'zustand/middleware'

type PositionStoreState = { position: { x: number; y: number } }

type PositionStoreActions = {
  setPosition: (nextPosition: PositionStoreState['position']) => void
}

type PositionStore = PositionStoreState & PositionStoreActions

const positionStore = createStore<PositionStore>()(
  persist(
    (set) => ({
      position: { x: 0, y: 0 },
      setPosition: (position) => set({ position }),
    }),
    {
      name: 'position-storage',
      skipHydration: true,
    },
  ),
)

const $dotContainer = document.getElementById('dot-container') as HTMLDivElement
const $dot = document.getElementById('dot') as HTMLDivElement

$dotContainer.addEventListener('pointermove', (event) => {
  positionStore.getState().setPosition({
    x: event.clientX,
    y: event.clientY,
  })
})

const render: Parameters<typeof positionStore.subscribe>[0] = (state) => {
  $dot.style.transform = `translate(${state.position.x}px, ${state.position.y}px)`
}

setTimeout(() => {
  positionStore.persist.rehydrate()
}, 2000)

render(positionStore.getState(), positionStore.getState())

positionStore.subscribe(render)
```

这是html代码

```html
<div
  id="dot-container"
  style="position: relative; width: 100vw; height: 100vh;"
>
  <div
    id="dot"
    style="position: absolute; background-color: red; border-radius: 50%; left: -10px; top: -10px; width: 20px; height: 20px;"
  ></div>
</div>
```

## 故障排除

待定
