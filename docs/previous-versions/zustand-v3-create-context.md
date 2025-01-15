---
title: 从 zustand/context 创建上下文
nav: 21
---

从 v3.5 开始提供了一个特殊的 `createContext`，它可以避免误用 store hook。

:::warning
注意：此函数在 v4 中已弃用，并将在 v5 中删除。请参阅[Migration](#migration)。
:::

```jsx
import create from 'zustand'
import createContext from 'zustand/context'

const { Provider, useStore } = createContext()

const createStore = () => create(...)

const App = () => (
  <Provider createStore={createStore}>
    ...
  </Provider>
)

const Component = () => {
  const state = useStore()
  const slice = useStore(selector)
  ...
```

## createContext在实际组件中的使用

```jsx
import create from "zustand";
import createContext from "zustand/context";

// 最佳实践：您可以将下面的 createContext() 和 createStore 移动到单独的文件（store.js）并导入 Provider，在此处/任何您需要的地方使用Store。

const { Provider, useStore } = createContext();

const createStore = () =>
  create((set) => ({
    bears: 0,
    increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
    removeAllBears: () => set({ bears: 0 })
  }));

const Button = () => {
  return (
      {/** store() - 这将为每次使用 Button 组件创建一个存储，而不是为所有组件使用一个存储 **/}
    <Provider createStore={createStore}>
      <ButtonChild />
    </Provider>
  );
};

const ButtonChild = () => {
  const state = useStore();
  return (
    <div>
      {state.bears}
      <button
        onClick={() => {
          state.increasePopulation();
        }}
      >
        +
      </button>
    </div>
  );
};

export default function App() {
  return (
    <div className="App">
      <Button />
      <Button />
    </div>
  );
}
```

## createContext使用props进行初始化

```tsx
import create from 'zustand'
import createContext from 'zustand/context'

const { Provider, useStore } = createContext()

export default function App({ initialBears }) {
  return (
    <Provider
      createStore={() =>
        create((set) => ({
          bears: initialBears,
          increase: () => set((state) => ({ bears: state.bears + 1 })),
        }))
      }
    >
      <Button />
    </Provider>
  )
}
```

## Migration

讨论: [https://github.com/pmndrs/zustand/discussions/1276](https://github.com/pmndrs/zustand/discussions/1276)

以下是 v4 API 的新上下文用法。

```jsx
import { createContext, useContext, useRef } from 'react'
import { createStore, useStore } from 'zustand'

const StoreContext = createContext(null)

const StoreProvider = ({ children }) => {
  const storeRef = useRef()
  if (!storeRef.current) {
    storeRef.current = createStore((set) => ({
      // ...
    }))
  }
  return (
    <StoreContext.Provider value={storeRef.current}>
      {children}
    </StoreContext.Provider>
  )
}

const useStoreInContext = (selector) => {
  const store = useContext(StoreContext)
  if (!store) {
    throw new Error('Missing StoreProvider')
  }
  return useStore(store, selector)
}
```

或者联系一些提供类似 Zustand v3 API 的第三方库：

- [https://github.com/charkour/zustand-di](https://github.com/charkour/zustand-di)
- [https://github.com/arvinxx/zustand-utils](https://github.com/arvinxx/zustand-utils)
