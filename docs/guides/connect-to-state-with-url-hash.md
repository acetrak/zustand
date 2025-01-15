---
title: 使用 URL 连接到状态
nav: 11
---

## 将状态与 URL 哈希连接起来

如果您想将存储的状态连接到 URL 哈希，您可以创建自己的哈希存储。

```ts
import { create } from 'zustand'
import { persist, StateStorage, createJSONStorage } from 'zustand/middleware'

const hashStorage: StateStorage = {
  getItem: (key): string => {
    const searchParams = new URLSearchParams(location.hash.slice(1))
    const storedValue = searchParams.get(key) ?? ''
    return JSON.parse(storedValue)
  },
  setItem: (key, newValue): void => {
    const searchParams = new URLSearchParams(location.hash.slice(1))
    searchParams.set(key, JSON.stringify(newValue))
    location.hash = searchParams.toString()
  },
  removeItem: (key): void => {
    const searchParams = new URLSearchParams(location.hash.slice(1))
    searchParams.delete(key)
    location.hash = searchParams.toString()
  },
}

export const useBoundStore = create(
  persist(
    (set, get) => ({
      fishes: 0,
      addAFish: () => set({ fishes: get().fishes + 1 }),
    }),
    {
      name: 'food-storage', // unique name
      storage: createJSONStorage(() => hashStorage),
    },
  ),
)
```

### CodeSandbox Demo

https://codesandbox.io/s/zustand-state-with-url-hash-demo-f29b88?file=/src/store/index.ts

## 使用 URL 参数保留和连接状态（示例：URL 查询参数）

有时您希望有条件地将状态连接到 URL。此示例描述了 URL 查询参数的使用，同时使其与另一个持久性实现（例如 `localstorage`）保持同步。

如果您希望始终填充 URL 参数，则可以删除对 `getUrlSearch()` 的条件检查。

当相关状态发生变化时，下面的实现将就地更新 URL，无需刷新。

```ts
import { create } from 'zustand'
import { persist, StateStorage, createJSONStorage } from 'zustand/middleware'

const getUrlSearch = () => {
  return window.location.search.slice(1)
}

const persistentStorage: StateStorage = {
  getItem: (key): string => {
    // 首先检查网址
    if (getUrlSearch()) {
      const searchParams = new URLSearchParams(getUrlSearch())
      const storedValue = searchParams.get(key)
      return JSON.parse(storedValue as string)
    } else {
      // 否则，我们应该从本地存储或替代存储加载
      return JSON.parse(localStorage.getItem(key) as string)
    }
  },
  setItem: (key, newValue): void => {
    // 检查查询参数是否存在，如果总是想设置 URL 可以删除检查
    if (getUrlSearch()) {
      const searchParams = new URLSearchParams(getUrlSearch())
      searchParams.set(key, JSON.stringify(newValue))
      window.history.replaceState(null, '', `?${searchParams.toString()}`)
    }

    localStorage.setItem(key, JSON.stringify(newValue))
  },
  removeItem: (key): void => {
    const searchParams = new URLSearchParams(getUrlSearch())
    searchParams.delete(key)
    window.location.search = searchParams.toString()
  },
}

type LocalAndUrlStore = {
  typesOfFish: string[]
  addTypeOfFish: (fishType: string) => void
  numberOfBears: number
  setNumberOfBears: (newNumber: number) => void
}

const storageOptions = {
  name: 'fishAndBearsStore',
  storage: createJSONStorage<LocalAndUrlStore>(() => persistentStorage),
}

const useLocalAndUrlStore = create(
  persist<LocalAndUrlStore>(
    (set) => ({
      typesOfFish: [],
      addTypeOfFish: (fishType) =>
        set((state) => ({ typesOfFish: [...state.typesOfFish, fishType] })),

      numberOfBears: 0,
      setNumberOfBears: (numberOfBears) => set(() => ({ numberOfBears })),
    }),
    storageOptions,
  ),
)

export default useLocalAndUrlStore
```

当从组件生成 URL 时，您可以调用 buildShareableUrl：

```ts
const buildURLSuffix = (params, version = 0) => {
  const searchParams = new URLSearchParams()

  const zustandStoreParams = {
    state: {
      typesOfFish: params.typesOfFish,
      numberOfBears: params.numberOfBears,
    },
    version: version, // 版本在这里是因为它包含在 Zustand 设置状态的方式中
  }

  // URL 参数键应与商店名称匹配，如上面 storageOptions 中指定的那样
  searchParams.set('fishAndBearsStore', JSON.stringify(zustandStoreParams))
  return searchParams.toString()
}

export const buildShareableUrl = (params, version) => {
  return `${window.location.origin}?${buildURLSuffix(params, version)}`
}
```

生成的 URL 看起来像这样（为了便于阅读，这里没有任何编码）

`https://localhost/search?fishAndBearsStore={"state":{"typesOfFish":["tilapia","salmon"],"numberOfBears":15},"version":0}}`
