---
title: 使用 props 初始化状态
nav: 13
---

在需要[依赖注入](https://en.wikipedia.org/wiki/Dependency_injection)的情况下，例如当应该使用组件中的 props 初始化存储时，推荐的方法是使用带有 React.context 的普通存储。

## 使用createStore创建Store

```ts
import { createStore } from 'zustand'

interface BearProps {
  bears: number
}

interface BearState extends BearProps {
  addBear: () => void
}

type BearStore = ReturnType<typeof createBearStore>

const createBearStore = (initProps?: Partial<BearProps>) => {
  const DEFAULT_PROPS: BearProps = {
    bears: 0,
  }
  return createStore<BearState>()((set) => ({
    ...DEFAULT_PROPS,
    ...initProps,
    addBear: () => set((state) => ({ bears: ++state.bears })),
  }))
}
```

## 使用`React.createContext`创建上下文

```ts
import { createContext } from 'react'

export const BearContext = createContext<BearStore | null>(null)
```

## 基本组件使用

```tsx
// Provider implementation
import { useRef } from 'react'

function App() {
  const store = useRef(createBearStore()).current
  return (
    <BearContext.Provider value={store}>
      <BasicConsumer />
    </BearContext.Provider>
  )
}
```

```tsx
// Consumer component
import { useContext } from 'react'
import { useStore } from 'zustand'

function BasicConsumer() {
  const store = useContext(BearContext)
  if (!store) throw new Error('Missing BearContext.Provider in the tree')
  const bears = useStore(store, (s) => s.bears)
  const addBear = useStore(store, (s) => s.addBear)
  return (
    <>
      <div>{bears} Bears.</div>
      <button onClick={addBear}>Add bear</button>
    </>
  )
}
```

## 常见模式

### 包装上下文提供者

```tsx
// Provider wrapper
import { useRef } from 'react'

type BearProviderProps = React.PropsWithChildren<BearProps>

function BearProvider({ children, ...props }: BearProviderProps) {
  const storeRef = useRef<BearStore>()
  if (!storeRef.current) {
    storeRef.current = createBearStore(props)
  }
  return (
    <BearContext.Provider value={storeRef.current}>
      {children}
    </BearContext.Provider>
  )
}
```

### 将上下文逻辑提取到自定义挂钩中

```tsx
// 模仿`create`返回的钩子
import { useContext } from 'react'
import { useStore } from 'zustand'

function useBearContext<T>(selector: (state: BearState) => T): T {
  const store = useContext(BearContext)
  if (!store) throw new Error('Missing BearContext.Provider in the tree')
  return useStore(store, selector)
}
```

```tsx
// Consumer usage of the custom hook
function CommonConsumer() {
  const bears = useBearContext((s) => s.bears)
  const addBear = useBearContext((s) => s.addBear)
  return (
    <>
      <div>{bears} Bears.</div>
      <button onClick={addBear}>Add bear</button>
    </>
  )
}
```

### （可选）允许使用自定义相等函数

```tsx
// 使用 useStoreWithEqualityFn 而不是 useStore 允许自定义相等函数
import { useContext } from 'react'
import { useStoreWithEqualityFn } from 'zustand/traditional'

function useBearContext<T>(
  selector: (state: BearState) => T,
  equalityFn?: (left: T, right: T) => boolean,
): T {
  const store = useContext(BearContext)
  if (!store) throw new Error('Missing BearContext.Provider in the tree')
  return useStoreWithEqualityFn(store, selector, equalityFn)
}
```

### 完整示例

```tsx
// Provider wrapper & custom hook consumer
function App2() {
  return (
    <BearProvider bears={2}>
      <HookConsumer />
    </BearProvider>
  )
}
```
