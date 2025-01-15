---
title: 持久存储数据
nav: 20
---

Persist 中间件使您能够将 Zustand 状态存储在存储（例如 `localStorage`、`AsyncStorage`、`IndexedDB `等）中，从而持久保存其数据。

请注意，此中间件支持同步存储（如 `localStorage`）和异步存储（如 `AsyncStorage`），但使用异步存储确实会带来成本。有关更多详细信息，请参阅[水合和异步存储](#hydration-and-asynchronous-storages)。

## 简单的例子

```ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useBearStore = create(
  persist(
    (set, get) => ({
      bears: 0,
      addABear: () => set({ bears: get().bears + 1 }),
    }),
    {
      name: 'food-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    },
  ),
)
```

## 选项

### `name`

这是唯一必需的选项。给定的名称将是用于在存储中存储 Zustand 状态的密钥，因此它必须是唯一的。

### `storage`

> Type: `() => StateStorage`

`StateStorage` 可以通过以下方式导入：

```ts
import { StateStorage } from 'zustand/middleware'
```

> Default: `createJSONStorage(() => localStorage)`

使您能够使用自己的存储。只需传递一个返回您要使用的存储的函数即可。建议使用 [`createJSONStorage`](#createjsonstorage) 辅助函数创建符合 `StateStorage` 接口的`storage`对象。

Example:

```ts
import { persist, createJSONStorage } from 'zustand/middleware'

export const useBoundStore = create(
  persist(
    (set, get) => ({
      // ...
    }),
    {
      // ...
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
)
```

### `partialize`

> Type: `(state: Object) => Object`

> Default: `(state) => state`

使您能够选择要存储在存储中的state的某些字段。

您可以使用以下命令省略多个字段：

```ts
export const useBoundStore = create(
  persist(
    (set, get) => ({
      foo: 0,
      bar: 1,
    }),
    {
      // ...
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) => !['foo'].includes(key)),
        ),
    },
  ),
)
```

或者您可以使用以下命令仅允许特定字段：

```ts
export const useBoundStore = create(
  persist(
    (set, get) => ({
      foo: 0,
      bar: 1,
    }),
    {
      // ...
      partialize: (state) => ({ foo: state.foo }),
    },
  ),
)
```

### `onRehydrateStorage`

> Type: `(state: Object) => ((state?: Object, error?: Error) => void) | void`

此选项使您能够传递一个侦听器函数，该函数将在存储水合时调用。

Example:

```ts
export const useBoundStore = create(
  persist(
    (set, get) => ({
      // ...
    }),
    {
      // ...
      onRehydrateStorage: (state) => {
        console.log('hydration starts')

        // optional
        return (state, error) => {
          if (error) {
            console.log('an error happened during hydration', error)
          } else {
            console.log('hydration finished')
          }
        }
      },
    },
  ),
)
```

### `version`

> Type: `number`

> Default: `0`

如果您想在存储中引入重大更改（例如重命名字段），您可以指定新的版本号。默认情况下，如果存储中的版本与代码中的版本不匹配，则不会使用存储的值。您可以使用迁移功能（见下文）来处理重大更改，以便保留以前存储的数据。

### `migrate`

> Type: `(persistedState: Object, version: number) => Object | Promise<Object>`

> Default: `(persistedState) => persistedState`

您可以使用此选项来处理版本迁移。 migrate 函数将持久状态和版本号作为参数。它必须返回符合最新版本（代码中的版本）的状态。

例如，如果您想重命名一个字段，您可以使用以下命令：

```ts
export const useBoundStore = create(
  persist(
    (set, get) => ({
      newField: 0, // let's say this field was named otherwise in version 0
    }),
    {
      // ...
      version: 1, // a migration will be triggered if the version in the storage mismatches this one
      migrate: (persistedState, version) => {
        if (version === 0) {
          // if the stored value is in version 0, we rename the field to the new name
          persistedState.newField = persistedState.oldField
          delete persistedState.oldField
        }

        return persistedState
      },
    },
  ),
)
```

### `merge`

> Type: `(persistedState: Object, currentState: Object) => Object`

> Default: `(persistedState, currentState) => ({ ...currentState, ...persistedState })`

在某些情况下，您可能希望使用自定义合并函数将持久值与当前状态合并。

默认情况下，中间件进行浅合并。如果您有部分持久化的嵌套对象，则浅层合并可能还不够。例如，如果存储包含以下内容：

```ts
{
  foo: {
    bar: 0,
  }
}
```

但您的 Zustand 商店包含：

```ts
{
  foo: {
    bar: 0,
    baz: 1,
  }
}
```

浅层合并将从 `foo` 对象中删除 `baz` 字段。解决此问题的一种方法是提供自定义深度合并函数：

```ts
export const useBoundStore = create(
  persist(
    (set, get) => ({
      foo: {
        bar: 0,
        baz: 1,
      },
    }),
    {
      // ...
      merge: (persistedState, currentState) =>
        deepMerge(currentState, persistedState),
    },
  ),
)
```

### `skipHydration`

> Type: `boolean | undefined`

> Default: `undefined`

默认情况下，存储将在初始化时被水化。

在某些应用中，您可能需要控制第一次水合发生的时间。例如，在服务器渲染的应用程序中。

如果您设置了`skipHydration`，则不会调用最初的水合调用，而是由您手动调用`reHydration()`。

```ts
export const useBoundStore = create(
  persist(
    () => ({
      count: 0,
      // ...
    }),
    {
      // ...
      skipHydration: true,
    },
  ),
)
```

```tsx
import { useBoundStore } from './path-to-store';

export function StoreConsumer() {
  // hydrate persisted store after on mount
  useEffect(() => {
    useBoundStore.persist.rehydrate();
  }, [])

  return (
    //...
  )
}
```

## API

> Version: >=3.6.3

Persist API 使您能够从 React 组件内部或外部与 Persist 中间件进行多种交互。

### `getOptions`

> Type: `() => Partial<PersistOptions>`

> Returns: Options of the Persist middleware

例如，可用于获取存储名称：

```ts
useBoundStore.persist.getOptions().name
```

### `setOptions`

> Type: `(newOptions: Partial<PersistOptions>) => void`

更改中间件选项。请注意，新选项将与当前选项合并。

例如，这可用于更改存储名称：

```ts
useBoundStore.persist.setOptions({
  name: 'new-name',
})
```

甚至更改存储引擎：

```ts
useBoundStore.persist.setOptions({
  storage: createJSONStorage(() => sessionStorage),
})
```

### `clearStorage`

> Type: `() => void`

清除[name](#name)下存储的所有内容。

```ts
useBoundStore.persist.clearStorage()
```

### `rehydrate`

> Type: `() => Promise<void>`

在某些情况下，您可能需要手动触发`rehydrate` 。这可以通过调用再水化方法来完成。

```ts
await useBoundStore.persist.rehydrate()
```

### `hasHydrated`

> Type: `() => boolean`

这是一个非反应式 getter，用于检查存储是否已被水化（请注意，它在调用[rehydrate](#rehydrate)时会更新）。

```ts
useBoundStore.persist.hasHydrated()
```

### `onHydrate`

> Type: `(listener: (state) => void) => () => void`

> Returns: Unsubscribe function

当水合过程开始时将调用此侦听器。

```ts
const unsub = useBoundStore.persist.onHydrate((state) => {
  console.log('hydration starts')
})

// later on...
unsub()
```

### `onFinishHydration`

> Type: `(listener: (state) => void) => () => void`

> Returns: Unsubscribe function

当水合过程结束时将调用此侦听器。

```ts
const unsub = useBoundStore.persist.onFinishHydration((state) => {
  console.log('hydration finished')
})

// later on...
unsub()
```

### `createJSONStorage`

> Type: `(getStorage: () => StateStorage, options?: JsonStorageOptions) => StateStorage`

> Returns: `PersistStorage`

此辅助函数使您能够创建一个[`storage`](#storage)对象，当您想要使用自定义存储引擎时，该对象非常有用。

`getStorage` 是一个返回具有 `getItem`、`setItem` 和 `removeItem` 属性的存储引擎的函数。

`options` 是一个可选对象，可用于自定义数据的序列化和反序列化。 `options.reviver` 是一个传递给 `JSON.parse` 来反序列化数据的函数。 `options.replacer` 是传递给 `JSON.stringify` 以序列化数据的函数。

```ts
import { createJSONStorage } from 'zustand/middleware'

const storage = createJSONStorage(() => sessionStorage, {
  reviver: (key, value) => {
    if (value && value.type === 'date') {
      return new Date(value)
    }
    return value
  },
  replacer: (key, value) => {
    if (value instanceof Date) {
      return { type: 'date', value: value.toISOString() }
    }
    return value
  },
})
```

## 水合和异步存储

要解释什么是异步存储的“成本”，您需要了解什么是水合。

简而言之，水化是从存储中检索持久状态并将其与当前状态合并的过程

Persist 中间件执行两种水合作用：同步和异步。如果给定的存储是同步的（例如 `localStorage`），则水合作用将同步完成。另一方面，如果给定的存储是异步的（例如，`AsyncStorage`），则水合作用将异步完成（令人震惊，我知道！）。

但有什么问题呢？通过同步水化，Zustand 商店在创建时就已经被水化了。相比之下，通过异步水化，Zustand 存储将稍后在微任务中进行水化。

为什么这很重要？异步水合可能会导致一些意外的行为。例如，如果您在 React 应用程序中使用 Zustand，商店将不会在初始渲染时被水化。如果您的应用程序依赖于页面加载时的持久值，您可能需要等到商店水合后再显示任何内容。例如，您的应用程序可能会认为用户未登录，因为这是默认设置，但实际上商店尚未完成水化。

如果您的应用程序确实取决于页面加载时的持久状态，请参阅下面的[FAQ](#faq)解答部分中的[如何检查我的商店是否已被水化](#how-can-i-check-if-my-store-has-been-hydrated)。

### 在Next.js中使用

NextJS 使用服务器端渲染，它会将服务器上渲染的组件与客户端上渲染的组件进行比较。但由于您正在使用浏览器中的数据来更改组件，因此两个渲染将会有所不同，并且 Next 会向您发出警告。

错误通常是：

- 文本内容与服务器呈现的 HTML 不匹配
- 水合失败，因为初始 UI 与服务器上呈现的内容不匹配
- 补水时出现错误。由于错误发生在 Suspense 边界之外，因此整个根将切换到客户端渲染

要解决这些错误，请创建一个自定义挂钩，以便 Zustand 在更改组件之前稍等片刻。

创建一个包含以下内容的文件

```ts
// useStore.ts
import { useState, useEffect } from 'react'

const useStore = <T, F>(
  store: (callback: (state: T) => unknown) => unknown,
  callback: (state: T) => F,
) => {
  const result = store(callback) as F
  const [data, setData] = useState<F>()

  useEffect(() => {
    setData(result)
  }, [result])

  return data
}

export default useStore
```

现在，在您的页面中，您将稍微不同地使用该钩子：

```ts
// useBearStore.ts

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// the store itself does not need any change
export const useBearStore = create(
  persist(
    (set, get) => ({
      bears: 0,
      addABear: () => set({ bears: get().bears + 1 }),
    }),
    {
      name: 'food-storage',
    },
  ),
)
```

```ts
// yourComponent.tsx

import useStore from './useStore'
import { useBearStore } from './stores/useBearStore'

const bears = useStore(useBearStore, (state) => state.bears)
```

致谢：这是对[一个问题的回复](https://github.com/pmndrs/zustand/issues/938#issuecomment-1481801942)，指向[这篇博文](https://dev.to/abdulsamad/how-to-use-zustands-persist-middleware-in-nextjs-4lb5)。

## FAQ

### 如何检查我的商店是否已补水

有几种不同的方法可以做到这一点。

您可以使用 [`onRehydrateStorage`](#onrehydratestorage) 侦听器函数来更新存储中的字段：

```ts
const useBoundStore = create(
  persist(
    (set, get) => ({
      // ...
      _hasHydrated: false,
      setHasHydrated: (state) => {
        set({
          _hasHydrated: state
        });
      }
    }),
    {
      // ...
      onRehydrateStorage: (state) => {
        return () => state.setHasHydrated(true)
      }
    }
  )
);

export default function App() {
  const hasHydrated = useBoundStore(state => state._hasHydrated);

  if (!hasHydrated) {
    return <p>Loading...</p>
  }

  return (
    // ...
  );
}
```

您还可以创建自定义 `useHydration` 挂钩：

```ts
const useBoundStore = create(persist(...))

const useHydration = () => {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    // Note: This is just in case you want to take into account manual rehydration.
    // You can remove the following line if you don't need it.
    const unsubHydrate = useBoundStore.persist.onHydrate(() => setHydrated(false))

    const unsubFinishHydration = useBoundStore.persist.onFinishHydration(() => setHydrated(true))

    setHydrated(useBoundStore.persist.hasHydrated())

    return () => {
      unsubHydrate()
      unsubFinishHydration()
    }
  }, [])

  return hydrated
}
```

### 如何使用自定义存储引擎

如果您要使用的存储与预期的 API 不匹配，您可以创建自己的存储：

```ts
import { create } from 'zustand'
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware'
import { get, set, del } from 'idb-keyval' // can use anything: IndexedDB, Ionic Storage, etc.

// Custom storage object
const storage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    console.log(name, 'has been retrieved')
    return (await get(name)) || null
  },
  setItem: async (name: string, value: string): Promise<void> => {
    console.log(name, 'with value', value, 'has been saved')
    await set(name, value)
  },
  removeItem: async (name: string): Promise<void> => {
    console.log(name, 'has been deleted')
    await del(name)
  },
}

export const useBoundStore = create(
  persist(
    (set, get) => ({
      bears: 0,
      addABear: () => set({ bears: get().bears + 1 }),
    }),
    {
      name: 'food-storage', // unique name
      storage: createJSONStorage(() => storage),
    },
  ),
)
```

如果您使用 `JSON.stringify()` 不支持的类型，则需要编写自己的序列化/反序列化代码。但是，如果这很乏味，您可以使用第三方库来序列化和反序列化不同类型的数据。

例如，[Superjson](https://github.com/blitz-js/superjson) 可以序列化数据及其类型，从而允许在反序列化时将数据解析回其原始类型

```ts
import superjson from 'superjson' //  can use anything: serialize-javascript, devalue, etc.
import { PersistStorage } from 'zustand/middleware'

interface BearState {
  bear: Map<string, string>
  fish: Set<string>
  time: Date
  query: RegExp
}

const storage: PersistStorage<BearState> = {
  getItem: (name) => {
    const str = localStorage.getItem(name)
    if (!str) return null
    return superjson.parse(str)
  },
  setItem: (name, value) => {
    localStorage.setItem(name, superjson.stringify(value))
  },
  removeItem: (name) => localStorage.removeItem(name),
}

const initialState: BearState = {
  bear: new Map(),
  fish: new Set(),
  time: new Date(),
  query: new RegExp(''),
}

export const useBearStore = create<BearState>()(
  persist(
    (set) => ({
      ...initialState,
      // ...
    }),
    {
      name: 'food-storage',
      storage,
    },
  ),
)
```

### 储存时如何补充水分

您可以使用 Persist API 创建自己的实现，类似于下面的示例：

```ts
type StoreWithPersist = Mutate<StoreApi<State>, [["zustand/persist", unknown]]>

export const withStorageDOMEvents = (store: StoreWithPersist) => {
  const storageEventCallback = (e: StorageEvent) => {
    if (e.key === store.persist.getOptions().name && e.newValue) {
      store.persist.rehydrate()
    }
  }

  window.addEventListener('storage', storageEventCallback)

  return () => {
    window.removeEventListener('storage', storageEventCallback)
  }
}

const useBoundStore = create(persist(...))
withStorageDOMEvents(useBoundStore)
```

### 如何将它与 TypeScript 一起使用

基本的打字稿用法不需要​​任何特殊的东西，除了编写 `create<State>()(...)` 而不是 `create(...)` 。

```tsx
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface MyState {
  bears: number
  addABear: () => void
}

export const useBearStore = create<MyState>()(
  persist(
    (set, get) => ({
      bears: 0,
      addABear: () => set({ bears: get().bears + 1 }),
    }),
    {
      name: 'food-storage', // name of item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // (optional) by default the 'localStorage' is used
      partialize: (state) => ({ bears: state.bears }),
    },
  ),
)
```

### 如何将其与 Map 和 Set 一起使用

为了持久保存 `Map` 和 `Set` 等对象类型，需要将它们转换为 `JSON` 可序列化类型（例如 `Array`），这可以通过定义自定义`storage`引擎来完成。

假设您的状态使用 `Map` 来处理`transactions`列表，那么您可以将 `Map` 转换为`storage`属性中的`Array`，如下所示：

```ts

interface BearState {
  .
  .
  .
  transactions: Map<any>
}

  storage: {
    getItem: (name) => {
      const str = localStorage.getItem(name);
      if (!str) return null;
      const existingValue = JSON.parse(str);
      return {
        ...existingValue,
        state: {
          ...existingValue.state,
          transactions: new Map(existingValue.state.transactions),
        }
      }
    },
    setItem: (name, newValue: StorageValue<BearState>) => {
      // functions cannot be JSON encoded
      const str = JSON.stringify({
        ...newValue,
        state: {
          ...newValue.state,
          transactions: Array.from(newValue.state.transactions.entries()),
        },
      })
      localStorage.setItem(name, str)
    },
    removeItem: (name) => localStorage.removeItem(name),
  },
```
