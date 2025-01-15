---
title: TypeScript 指南
nav: 7
---

## 基本用法

使用 TypeScript 时的区别在于，您必须编写 `create<T>()(...)` （请注意额外的括号 `()` 以及类型参数），而不是编写 `create(...)`，其中 `T` 是对其进行注释的状态类型。例如：

```ts
import { create } from 'zustand'

interface BearState {
  bears: number
  increase: (by: number) => void
}

const useBearStore = create<BearState>()((set) => ({
  bears: 0,
  increase: (by) => set((state) => ({ bears: state.bears + by })),
}))
```

<details>
  <summary>为什么我们不能简单地从初始状态推断类型？</summary>

  <br/>

**TLDR**: 因为状态通用 `T` 是不变的.

考虑这个最小版本 `create`:

```ts
declare const create: <T>(f: (get: () => T) => T) => T

const x = create((get) => ({
  foo: 0,
  bar: () => get(),
}))
// `x` 被推断为 `unknown` 而不是
// interface X {
//   foo: number,
//   bar: () => X
// }
```

在这里，如果您查看 `create` 中 `f` 的类型，即 `(get: () => T) => T`，它通过 return“给出”`T`（使其协变），但它也通过 `get` (使其逆变）。 “那么`T`从哪里来呢？” TypeScript 创造奇迹。这就像先有鸡还是先有蛋的问题。最后，TypeScript 放弃并推断 `T`为`unknown`。

因此，只要要推断的泛型是不变的（即协变和逆变），TypeScript 将无法推断它。另一个简单的例子是这样的：

```ts
const createFoo = {} as <T>(f: (t: T) => T) => T
const x = createFoo((_) => 'hello')
```

这里，x 是`unknown`，而不是`string`。

  <details>
    <summary>更多关于推理的内容（仅供对 TypeScript 好奇和感兴趣的人使用）</summary>

从某种意义上说，这种推理失败不是问题，因为无法写入 `<T>(f: (t: T) => T) => T` 类型的值。也就是说你无法编写`createFoo`的真正运行时实现。我们来尝试一下：

```js
const createFoo = (f) => f(/* ? */)
```

`createFoo`需要返回`f`的返回值。为此，我们首先必须调用 `f`。要调用它，我们必须传递 `T` 类型的值。要传递 `T` 类型的值，我们首先必须生成它。但是，当我们甚至不知道 `T` 是什么时，如何生成 `T`类型的值呢？生成 `T` 类型值的唯一方法是调用 `f`，但是要调用 `f` 本身，我们需要一个 `T` 类型值。所以您会发现实际上不可能编写 `createFoo`。

所以我们要说的是，`createFoo` 情况下的推理失败并不是真正的问题，因为不可能实现 `createFoo`。但是`create`时推理失败怎么办？这也不是真正的问题，因为它也不可能实现`create`。等一下，如果`create`无法实现，那么Zustand如何实现呢？答案是，没有。

Zustand谎称它实现了`create`的类型，但它只实现了其中的大部分。这是通过显示不合理性来进行的简单证明。考虑以下代码：

```ts
import { create } from 'zustand'

const useBoundStore = create<{ foo: number }>()((_, get) => ({
  foo: get().foo,
}))
```

这段代码可以编译。但是如果我们运行它，我们会得到一个异常：“Uncaught TypeError：无法读取未定义的属性（读取'foo'）”。这是因为 `get` 在创建初始状态之前会返回 `undefined` （因此在创建初始状态时不应该调用 `get` ）。类型承诺 `get` 永远不会返回 `undefined`，但它最初确实返回，这意味着 Zustand 未能实现它。

当然，Zustand 失败了，因为它不可能实现类型承诺的`create`方式（就像不可能实现 `createFoo` 一样）。换句话说，我们没有一个类型来表达我们已经实现的实际`create`。我们不能输入 `get` as `() => T | undefined` 因为它会造成不便，而且它仍然不正确，因为 `get` 最终确实是 `() => T`，只是如果同步调用它就会是 `() => undefined`。我们需要的是某种 TypeScript 功能，允许我们输入 `get` as `(() => T) & WhenSync<() => undefined>`，这当然是极其牵强的。

所以我们有两个问题：缺乏推理和不合理。如果 TypeScript 可以改进其对不变量的推理，则可以解决推理不足的问题。如果 TypeScript 引入像 `WhenSync` 这样的东西，就可以解决不健全的问题。为了解决缺乏推理的问题，我们手动注释状态类型。我们无法解决不健全的问题，但这也不是什么大问题，因为它不多，无论如何同步调用 `get` 没有意义。

</details>

</details>

<details>
  <summary>为什么要柯里化 ()(...)</summary>

  <br/>

**TLDR**: 这是[microsoft/TypeScript#10571](https://github.com/microsoft/TypeScript/issues/10571)解决方法.

想象一下你有这样的场景：

```ts
declare const withError: <T, E>(
  p: Promise<T>,
) => Promise<[error: undefined, value: T] | [error: E, value: undefined]>
declare const doSomething: () => Promise<string>

const main = async () => {
  let [error, value] = await withError(doSomething())
}
```

这里，`T` 被推断为`string`，`E` 被推断为`unknown`。您可能希望将 `E` 注释为 `Foo`，因为您确定 `doSomething()` 会抛出的错误的形状。但是，您不能这样做。您可以传递所有泛型，也可以不传递任何泛型。除了将 `E` 注释为 `Foo` 之外，您还必须将 `T` 注释为`string`，即使它无论如何都会被推断出来。解决方案是制作一个在运行时不执行任何操作的 `withError` 的柯里化版本。它的目的只是让您注释 `E`。

```ts
declare const withError: {
  <E>(): <T>(
    p: Promise<T>,
  ) => Promise<[error: undefined, value: T] | [error: E, value: undefined]>
  <T, E>(
    p: Promise<T>,
  ): Promise<[error: undefined, value: T] | [error: E, value: undefined]>
}
declare const doSomething: () => Promise<string>
interface Foo {
  bar: string
}

const main = async () => {
  let [error, value] = await withError<Foo>()(doSomething())
}
```

这样，`T` 就会被推断出来，并且您可以注释 `E`。当我们想要注释状态（第一个类型参数）但允许推断其他参数时，Zustand 具有相同的用例。

</details>

或者，您也可以使用`combine`，它会推断状态，这样您就不需要键入它。

```ts
import { create } from 'zustand'
import { combine } from 'zustand/middleware'

const useBearStore = create(
  combine({ bears: 0 }, (set) => ({
    increase: (by: number) => set((state) => ({ bears: state.bears + by })),
  })),
)
```

<details>
  <summary>小心一点</summary>

  <br/>

我们通过稍微了解一下您收到的作为参数的 `set`、`get` 和 `store` 的类型来实现推断。谎言是，它们的类型就好像状态是第一个参数，而实际上状态是第一个参数和第二个参数的返回值的浅层合并 (`{ ...a, ...b }`)。例如，从第二个参数`get`的类型为 `() => { bears: number }` ，这是一个谎言，因为它应该是 `() => { bears: number,increase: (by: number) => void }`。并且 `useBearStore` 仍然具有正确的类型；例如，`useBearStore.getState` 的类型为 `() => { bears: number,increase: (by: number) => void }`。

这并不是真正的谎言，因为 `{ bears: number }` 仍然是 `{ bears: number,increase: (by: number) => void }` 的子类型。因此，大多数情况下是不会有问题的。使用替换时你应该小心。例如， `set({ bears: 0 }, true)` 可以编译，但不健全，因为它会删除`increase`函数。另一个需要小心的例子是使用 `Object.keys`。 `Object.keys(get())` 将返回 `["bears", "increase"]` 而不是 `["bears"]`。 `get` 的返回类型可能会让您陷入这些错误。

`combine` 牺牲了一点类型安全性，以方便不必为状态编写类型。因此，您应该相应地使用`combine`。大多数情况下都可以，使用起来也很方便。

</details>

请注意，在使用`combine`时我们不使用柯里化版本，因为`combine`“创建”状态。当使用创建状态的中间件时，没有必要使用柯里化版本，因为现在可以推断状态。另一个创建状态的中间件是 `redux`。因此，当使用`combine`、`redux`或任何其他创建状态的自定义中间件时，我们不建议使用柯里化版本。

如果您想在状态声明之外推断状态类型，您可以使用 `ExtractState` 类型帮助器：

```ts
import { create, ExtractState } from 'zustand'
import { combine } from 'zustand/middleware'

type BearState = ExtractState<typeof useBearStore>

const useBearStore = create(
  combine({ bears: 0 }, (set) => ({
    increase: (by: number) => set((state) => ({ bears: state.bears + by })),
  })),
)
```

## 使用 middlewares

您无需执行任何特殊操作即可在 TypeScript 中使用中间件。

```ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface BearState {
  bears: number
  increase: (by: number) => void
}

const useBearStore = create<BearState>()(
  devtools(
    persist(
      (set) => ({
        bears: 0,
        increase: (by) => set((state) => ({ bears: state.bears + by })),
      }),
      { name: 'bearStore' },
    ),
  ),
)
```

只需确保您在 `create` 中立即使用它们，以便使上下文推理发挥作用。做一些甚至有点奇特的事情，比如下面的 `myMiddlewares` ，都需要更高级的类型。

```ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

const myMiddlewares = (f) => devtools(persist(f, { name: 'bearStore' }))

interface BearState {
  bears: number
  increase: (by: number) => void
}

const useBearStore = create<BearState>()(
  myMiddlewares((set) => ({
    bears: 0,
    increase: (by) => set((state) => ({ bears: state.bears + by })),
  })),
)
```

另外，我们建议尽可能最后使用 `devtools` 中间件。例如，当您将它与 `immer` 作为中间件一起使用时，它应该是 `devtools(immer(...))` 而不是 `immer(devtools(...))`。这是因为 `devtools` 改变了 `setState` 并在其上添加了一个类型参数，如果其他中间件（如 `immer`）也在 `devtools` 之前改变了 `setState`，则该类型参数可能会丢失。因此，最后使用 `devtools` 可确保没有中间件在其之前改变 `setState`。

## 编写中间件和高级用法

想象一下您必须编写这个假设的中间件。

```ts
import { create } from 'zustand'

const foo = (f, bar) => (set, get, store) => {
  store.foo = bar
  return f(set, get, store)
}

const useBearStore = create(foo(() => ({ bears: 0 }), 'hello'))
console.log(useBearStore.foo.toUpperCase())
```

Zustand 中间件可以改变存储。但是我们如何才能在类型级别上对突变进行编码呢？也就是说，我们如何输入 `foo` 才能使该代码编译？

对于通常的静态类型语言来说，这是不可能的。但多亏了 TypeScript，Zustand 拥有一种称为“更高种类的变异器”的东西，使这成为可能。如果您正在处理复杂的类型问题，例如键入中间件或使用 `StateCreator` 类型，您将必须了解此实现细节。为此，您可以[查看 #710](https://github.com/pmndrs/zustand/issues/710)。

If you are eager to know what the answer is to this particular problem then you can [see it here](#middleware-that-changes-the-store-type).

### Handling Dynamic `replace` Flag

If the value of the `replace` flag is not known at compile time and is determined dynamically, you might face issues. To handle this, you can use a workaround by annotating the `replace` parameter with the parameters of the `setState` function:

```ts
const replaceFlag = Math.random() > 0.5
const args = [{ bears: 5 }, replaceFlag] as Parameters<
  typeof useBearStore.setState
>
store.setState(...args)
```

#### Example with `as Parameters` Workaround

```ts
import { create } from 'zustand'

interface BearState {
  bears: number
  increase: (by: number) => void
}

const useBearStore = create<BearState>()((set) => ({
  bears: 0,
  increase: (by) => set((state) => ({ bears: state.bears + by })),
}))

const replaceFlag = Math.random() > 0.5
const args = [{ bears: 5 }, replaceFlag] as Parameters<
  typeof useBearStore.setState
>
useBearStore.setState(...args) // Using the workaround
```

By following this approach, you can ensure that your code handles dynamic `replace` flags without encountering type issues.

## Common recipes

### Middleware that doesn't change the store type

```ts
import { create, StateCreator, StoreMutatorIdentifier } from 'zustand'

type Logger = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  f: StateCreator<T, Mps, Mcs>,
  name?: string,
) => StateCreator<T, Mps, Mcs>

type LoggerImpl = <T>(
  f: StateCreator<T, [], []>,
  name?: string,
) => StateCreator<T, [], []>

const loggerImpl: LoggerImpl = (f, name) => (set, get, store) => {
  const loggedSet: typeof set = (...a) => {
    set(...(a as Parameters<typeof set>))
    console.log(...(name ? [`${name}:`] : []), get())
  }
  const setState = store.setState
  store.setState = (...a) => {
    setState(...(a as Parameters<typeof setState>))
    console.log(...(name ? [`${name}:`] : []), store.getState())
  }

  return f(loggedSet, get, store)
}

export const logger = loggerImpl as unknown as Logger

// ---

const useBearStore = create<BearState>()(
  logger(
    (set) => ({
      bears: 0,
      increase: (by) => set((state) => ({ bears: state.bears + by })),
    }),
    'bear-store',
  ),
)
```

### Middleware that changes the store type

```ts
import {
  create,
  StateCreator,
  StoreMutatorIdentifier,
  Mutate,
  StoreApi,
} from 'zustand'

type Foo = <
  T,
  A,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  f: StateCreator<T, [...Mps, ['foo', A]], Mcs>,
  bar: A,
) => StateCreator<T, Mps, [['foo', A], ...Mcs]>

declare module 'zustand' {
  interface StoreMutators<S, A> {
    foo: Write<Cast<S, object>, { foo: A }>
  }
}

type FooImpl = <T, A>(
  f: StateCreator<T, [], []>,
  bar: A,
) => StateCreator<T, [], []>

const fooImpl: FooImpl = (f, bar) => (set, get, _store) => {
  type T = ReturnType<typeof f>
  type A = typeof bar

  const store = _store as Mutate<StoreApi<T>, [['foo', A]]>
  store.foo = bar
  return f(set, get, _store)
}

export const foo = fooImpl as unknown as Foo

type Write<T extends object, U extends object> = Omit<T, keyof U> & U

type Cast<T, U> = T extends U ? T : U

// ---

const useBearStore = create(foo(() => ({ bears: 0 }), 'hello'))
console.log(useBearStore.foo.toUpperCase())
```

### `create` without curried workaround

The recommended way to use `create` is using the curried workaround like so: `create<T>()(...)`. This is because it enables you to infer the store type. But if for some reason you do not want to use the workaround, you can pass the type parameters like the following. Note that in some cases, this acts as an assertion instead of annotation, so we don't recommend it.

```ts
import { create } from "zustand"

interface BearState {
  bears: number
  increase: (by: number) => void
}

const useBearStore = create<
  BearState,
  [
    ['zustand/persist', BearState],
    ['zustand/devtools', never]
  ]
>(devtools(persist((set) => ({
  bears: 0,
  increase: (by) => set((state) => ({ bears: state.bears + by })),
}), { name: 'bearStore' }))
```

### Slices pattern

```ts
import { create, StateCreator } from 'zustand'

interface BearSlice {
  bears: number
  addBear: () => void
  eatFish: () => void
}

interface FishSlice {
  fishes: number
  addFish: () => void
}

interface SharedSlice {
  addBoth: () => void
  getBoth: () => void
}

const createBearSlice: StateCreator<
  BearSlice & FishSlice,
  [],
  [],
  BearSlice
> = (set) => ({
  bears: 0,
  addBear: () => set((state) => ({ bears: state.bears + 1 })),
  eatFish: () => set((state) => ({ fishes: state.fishes - 1 })),
})

const createFishSlice: StateCreator<
  BearSlice & FishSlice,
  [],
  [],
  FishSlice
> = (set) => ({
  fishes: 0,
  addFish: () => set((state) => ({ fishes: state.fishes + 1 })),
})

const createSharedSlice: StateCreator<
  BearSlice & FishSlice,
  [],
  [],
  SharedSlice
> = (set, get) => ({
  addBoth: () => {
    // you can reuse previous methods
    get().addBear()
    get().addFish()
    // or do them from scratch
    // set((state) => ({ bears: state.bears + 1, fishes: state.fishes + 1 })
  },
  getBoth: () => get().bears + get().fishes,
})

const useBoundStore = create<BearSlice & FishSlice & SharedSlice>()((...a) => ({
  ...createBearSlice(...a),
  ...createFishSlice(...a),
  ...createSharedSlice(...a),
}))
```

A detailed explanation on the slices pattern can be found [here](./slices-pattern.md).

If you have some middlewares then replace `StateCreator<MyState, [], [], MySlice>` with `StateCreator<MyState, Mutators, [], MySlice>`. For example, if you are using `devtools` then it will be `StateCreator<MyState, [["zustand/devtools", never]], [], MySlice>`. See the ["Middlewares and their mutators reference"](#middlewares-and-their-mutators-reference) section for a list of all mutators.

### Bounded `useStore` hook for vanilla stores

```ts
import { useStore } from 'zustand'
import { createStore } from 'zustand/vanilla'

interface BearState {
  bears: number
  increase: (by: number) => void
}

const bearStore = createStore<BearState>()((set) => ({
  bears: 0,
  increase: (by) => set((state) => ({ bears: state.bears + by })),
}))

function useBearStore(): BearState
function useBearStore<T>(selector: (state: BearState) => T): T
function useBearStore<T>(selector?: (state: BearState) => T) {
  return useStore(bearStore, selector!)
}
```

You can also make an abstract `createBoundedUseStore` function if you need to create bounded `useStore` hooks often and want to DRY things up...

```ts
import { useStore, StoreApi } from 'zustand'
import { createStore } from 'zustand/vanilla'

interface BearState {
  bears: number
  increase: (by: number) => void
}

const bearStore = createStore<BearState>()((set) => ({
  bears: 0,
  increase: (by) => set((state) => ({ bears: state.bears + by })),
}))

const createBoundedUseStore = ((store) => (selector) =>
  useStore(store, selector)) as <S extends StoreApi<unknown>>(
  store: S,
) => {
  (): ExtractState<S>
  <T>(selector: (state: ExtractState<S>) => T): T
}

type ExtractState<S> = S extends { getState: () => infer X } ? X : never

const useBearStore = createBoundedUseStore(bearStore)
```

## Middlewares and their mutators reference

- `devtools` — `["zustand/devtools", never]`
- `persist` — `["zustand/persist", YourPersistedState]`<br/>
  `YourPersistedState` is the type of state you are going to persist, ie the return type of `options.partialize`, if you're not passing `partialize` options the `YourPersistedState` becomes `Partial<YourState>`. Also [sometimes](https://github.com/pmndrs/zustand/issues/980#issuecomment-1162289836) passing actual `PersistedState` won't work. In those cases, try passing `unknown`.
- `immer` — `["zustand/immer", never]`
- `subscribeWithSelector` — `["zustand/subscribeWithSelector", never]`
- `redux` — `["zustand/redux", YourAction]`
- `combine` — no mutator as `combine` does not mutate the store
