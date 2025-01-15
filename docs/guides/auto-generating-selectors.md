---
title: 自动生成选择器
nav: 5
---

我们建议在使用商店中的属性或操作时使用选择器。您可以像这样从商店访问值：

```typescript
const bears = useBearStore((state) => state.bears)
```

然而，写这些可能会很乏味。如果您是这种情况，您可以自动生成选择器。

## 创建以下函数：`createSelectors`

```typescript
import { StoreApi, UseBoundStore } from 'zustand'

type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]: () => T[K] } }
  : never

const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(
  _store: S,
) => {
  let store = _store as WithSelectors<typeof _store>
  store.use = {}
  for (let k of Object.keys(store.getState())) {
    ;(store.use as any)[k] = () => store((s) => s[k as keyof typeof s])
  }

  return store
}
```

如果你有一家这样的store ：

```typescript
interface BearState {
  bears: number
  increase: (by: number) => void
  increment: () => void
}

const useBearStoreBase = create<BearState>()((set) => ({
  bears: 0,
  increase: (by) => set((state) => ({ bears: state.bears + by })),
  increment: () => set((state) => ({ bears: state.bears + 1 })),
}))
```

将该函数应用到您的store:

```typescript
const useBearStore = createSelectors(useBearStoreBase)
```

现在选择器是自动生成的，您可以直接访问它们：

```typescript
// get the property
const bears = useBearStore.use.bears()

// get the action
const increment = useBearStore.use.increment()
```

## Vanilla Store

如果您使用的是vanilla store，请使用以下 `createSelectors` 函数：

```typescript
import { StoreApi, useStore } from 'zustand'

type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]: () => T[K] } }
  : never

const createSelectors = <S extends StoreApi<object>>(_store: S) => {
  const store = _store as WithSelectors<typeof _store>
  store.use = {}
  for (const k of Object.keys(store.getState())) {
    ;(store.use as any)[k] = () =>
      useStore(_store, (s) => s[k as keyof typeof s])
  }

  return store
}
```

用法与 React store 相同。如果你有一家这样的store：

```typescript
import { createStore } from 'zustand'

interface BearState {
  bears: number
  increase: (by: number) => void
  increment: () => void
}

const store = createStore<BearState>((set) => ({
  bears: 0,
  increase: (by) => set((state) => ({ bears: state.bears + by })),
  increment: () => set((state) => ({ bears: state.bears + 1 })),
}))
```

将该函数应用到您的 store:

```typescript
const useBearStore = createSelectors(store)
```

现在选择器是自动生成的，您可以直接访问它们：

```typescript
// get the property
const bears = useBearStore.use.bears()

// get the action
const increment = useBearStore.use.increment()
```

## Live Demo


有关此操作的示例，请参阅[Code Sandbox](https://codesandbox.io/s/zustand-auto-generate-selectors-forked-rl8v5e?file=/src/selectors.ts)。

## 第三方库

- [auto-zustand-selectors-hook](https://github.com/Albert-Gao/auto-zustand-selectors-hook)
- [react-hooks-global-state](https://github.com/dai-shi/react-hooks-global-state)
- [zustood](https://github.com/udecode/zustood)
- [@davstack/store](https://github.com/DawidWraga/davstack)
