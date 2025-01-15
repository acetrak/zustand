---
title: 在Next.js上使用
nav: 17
---

[Next.js](https://nextjs.org) 是一种流行的 React 服务器端渲染框架，它为正确使用 Zustand 带来了一些独特的挑战。请记住，Zustand 存储是一个全局变量（也称为模块状态），因此可以选择使用上下文。这些挑战包括：

- **按请求存储:** Next.js 服务器可以同时处理多个请求。这意味着应该根据请求创建存储，并且不应在请求之间共享。
- **SSR 友好:** Next.js 应用程序会渲染两次，首先在服务器上，然后在客户端上。客户端和服务器上的输出不同将导致“水合错误”。必须在服务器上初始化存储，然后使用相同的数据在客户端上重新初始化，以避免这种情况。请在我们的 [SSR and Hydration](./ssr-and-hydration)指南中阅读更多相关信息。
- **SPA 路由友好:** Next.js 支持客户端路由的混合模型，这意味着为了重置存储，我们需要使用 `Context` 在组件级别对其进行初始化。
- **服务器缓存友好:** Next.js 的最新版本（特别是使用 App Router 架构的应用程序）支持积极的服务器缓存。由于我们的存储是 **module state**，因此它与此缓存完全兼容。

对于正确使用 Zustand，我们有以下一般建议：

- **无全局存储** - 因为存储不应在请求之间共享，所以不应将其定义为全局变量。相反，应该根据请求创建store 。
- **React 服务器组件不应读取或写入存储** - RSC 不能使用钩子或上下文。它们并不意味着是有状态的。让 RSC 从全局存储读取值或向全局存储写入值违反了 Next.js 的架构。

### 根据请求创建store

让我们编写store工厂函数，为每个请求创建一个新的store。

```json
// tsconfig.json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

:::warning
不要忘记删除 tsconfig.json 文件中的所有注释。
:::

```ts
// src/stores/counter-store.ts
import { createStore } from 'zustand/vanilla'

export type CounterState = {
  count: number
}

export type CounterActions = {
  decrementCount: () => void
  incrementCount: () => void
}

export type CounterStore = CounterState & CounterActions

export const defaultInitState: CounterState = {
  count: 0,
}

export const createCounterStore = (
  initState: CounterState = defaultInitState,
) => {
  return createStore<CounterStore>()((set) => ({
    ...initState,
    decrementCount: () => set((state) => ({ count: state.count - 1 })),
    incrementCount: () => set((state) => ({ count: state.count + 1 })),
  }))
}
```

### 提供store

让我们在组件中使用 `createCounterStore` 并使用上下文提供程序共享它。

```tsx
// src/providers/counter-store-provider.tsx
'use client'

import { type ReactNode, createContext, useRef, useContext } from 'react'
import { useStore } from 'zustand'

import { type CounterStore, createCounterStore } from '@/stores/counter-store'

export type CounterStoreApi = ReturnType<typeof createCounterStore>

export const CounterStoreContext = createContext<CounterStoreApi | undefined>(
  undefined,
)

export interface CounterStoreProviderProps {
  children: ReactNode
}

export const CounterStoreProvider = ({
  children,
}: CounterStoreProviderProps) => {
  const storeRef = useRef<CounterStoreApi>()
  if (!storeRef.current) {
    storeRef.current = createCounterStore()
  }

  return (
    <CounterStoreContext.Provider value={storeRef.current}>
      {children}
    </CounterStoreContext.Provider>
  )
}

export const useCounterStore = <T,>(
  selector: (store: CounterStore) => T,
): T => {
  const counterStoreContext = useContext(CounterStoreContext)

  if (!counterStoreContext) {
    throw new Error(`useCounterStore must be used within CounterStoreProvider`)
  }

  return useStore(counterStoreContext, selector)
}
```

:::tip
在此示例中，我们通过检查引用的值来确保该组件是重新渲染安全的，以便存储仅创建一次。对于服务器上的每个请求，此组件只会呈现一次，但如果树中此组件上方有有状态客户端组件，或者此组件还包含其他可变状态，则可能会在客户端上重新呈现多次重新渲染。
:::

### 初始化store

```ts
// src/stores/counter-store.ts
import { createStore } from 'zustand/vanilla'

export type CounterState = {
  count: number
}

export type CounterActions = {
  decrementCount: () => void
  incrementCount: () => void
}

export type CounterStore = CounterState & CounterActions

export const initCounterStore = (): CounterState => {
  return { count: new Date().getFullYear() }
}

export const defaultInitState: CounterState = {
  count: 0,
}

export const createCounterStore = (
  initState: CounterState = defaultInitState,
) => {
  return createStore<CounterStore>()((set) => ({
    ...initState,
    decrementCount: () => set((state) => ({ count: state.count - 1 })),
    incrementCount: () => set((state) => ({ count: state.count + 1 })),
  }))
}
```

```tsx
// src/providers/counter-store-provider.tsx
'use client'

import { type ReactNode, createContext, useRef, useContext } from 'react'
import { useStore } from 'zustand'

import {
  type CounterStore,
  createCounterStore,
  initCounterStore,
} from '@/stores/counter-store'

export type CounterStoreApi = ReturnType<typeof createCounterStore>

export const CounterStoreContext = createContext<CounterStoreApi | undefined>(
  undefined,
)

export interface CounterStoreProviderProps {
  children: ReactNode
}

export const CounterStoreProvider = ({
  children,
}: CounterStoreProviderProps) => {
  const storeRef = useRef<CounterStoreApi>()
  if (!storeRef.current) {
    storeRef.current = createCounterStore(initCounterStore())
  }

  return (
    <CounterStoreContext.Provider value={storeRef.current}>
      {children}
    </CounterStoreContext.Provider>
  )
}

export const useCounterStore = <T,>(
  selector: (store: CounterStore) => T,
): T => {
  const counterStoreContext = useContext(CounterStoreContext)

  if (!counterStoreContext) {
    throw new Error(`useCounterStore must be used within CounterStoreProvider`)
  }

  return useStore(counterStoreContext, selector)
}
```

### 使用具有不同架构的Store

Next.js 应用程序有两种架构：[Pages Router](https://nextjs.org/docs/pages/building-your-application/routing) 和 [App Router](https://nextjs.org/docs/app/building-your-application/routing)。 Zustand 在两种架构上的用法应该是相同的，只是与每种架构相关的细微差别。

#### Pages Router

```tsx
// src/components/pages/home-page.tsx
import { useCounterStore } from '@/providers/counter-store-provider.ts'

export const HomePage = () => {
  const { count, incrementCount, decrementCount } = useCounterStore(
    (state) => state,
  )

  return (
    <div>
      Count: {count}
      <hr />
      <button type="button" onClick={() => void incrementCount()}>
        Increment Count
      </button>
      <button type="button" onClick={() => void decrementCount()}>
        Decrement Count
      </button>
    </div>
  )
}
```

```tsx
// src/_app.tsx
import type { AppProps } from 'next/app'

import { CounterStoreProvider } from '@/providers/counter-store-provider.tsx'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <CounterStoreProvider>
      <Component {...pageProps} />
    </CounterStoreProvider>
  )
}
```

```tsx
// src/pages/index.tsx
import { HomePage } from '@/components/pages/home-page.tsx'

export default function Home() {
  return <HomePage />
}
```

:::warning
注意：为每个路由创建一个存储需要在页面（路由）组件级别创建和共享存储。如果您不需要为每个路由创建一个商店，请尽量不要使用此选项。
:::

```tsx
// src/pages/index.tsx
import { CounterStoreProvider } from '@/providers/counter-store-provider.tsx'
import { HomePage } from '@/components/pages/home-page.tsx'

export default function Home() {
  return (
    <CounterStoreProvider>
      <HomePage />
    </CounterStoreProvider>
  )
}
```

#### App Router

```tsx
// src/components/pages/home-page.tsx
'use client'

import { useCounterStore } from '@/providers/counter-store-provider'

export const HomePage = () => {
  const { count, incrementCount, decrementCount } = useCounterStore(
    (state) => state,
  )

  return (
    <div>
      Count: {count}
      <hr />
      <button type="button" onClick={() => void incrementCount()}>
        Increment Count
      </button>
      <button type="button" onClick={() => void decrementCount()}>
        Decrement Count
      </button>
    </div>
  )
}
```

```tsx
// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

import { CounterStoreProvider } from '@/providers/counter-store-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CounterStoreProvider>{children}</CounterStoreProvider>
      </body>
    </html>
  )
}
```

```tsx
// src/app/page.tsx
import { HomePage } from '@/components/pages/home-page'

export default function Home() {
  return <HomePage />
}
```

:::warning
为每个路由创建一个存储需要在页面（路由）组件级别创建和共享存储。如果您不需要为每个路由创建一个商店，请尽量不要使用此选项。
:::

```tsx
// src/app/page.tsx
import { CounterStoreProvider } from '@/providers/counter-store-provider'
import { HomePage } from '@/components/pages/home-page'

export default function Home() {
  return (
    <CounterStoreProvider>
      <HomePage />
    </CounterStoreProvider>
  )
}
```
