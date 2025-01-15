---
title: createWithEqualityFn ⚛️
description: 如何打造高效stores
nav: 25
---

`createWithEqualityFn` 允许您创建一个附加 API 实用程序的 React Hook，就像 `create` 一样。但是，它提供了一种定义自定义相等性检查的方法。这样可以更精细地控制组件何时重新渲染，从而提高性能和响应能力。

```js
const useSomeStore = createWithEqualityFn(stateCreatorFn, equalityFn)
```

## 类型

### 签名

```ts
createWithEqualityFn<T>()(stateCreatorFn: StateCreator<T, [], []>, equalityFn?: (a: T, b: T) => boolean): UseBoundStore<StoreApi<T>>
```

## 语法

### `createWithEqualityFn(stateCreatorFn)`

#### 参数

- `stateCreatorFn`: 一个以 `set` 函数、`get` 函数和 `store` 作为参数的函数。通常，您将返回一个带有您想要公开的方法的对象。
- **可选** `equalityFn`: 默认为 `Object.is`。一个可以让您跳过重新渲染的函数。

#### 返回

`createWithEqualityFn` 返回一个带有 API 实用程序的 React Hook，就像 `create` 一样。它允许您使用选择器函数返回基于当前状态的数据，并允许您使用相等函数跳过重新渲染。它应该采用选择器函数和相等函数作为参数

## 使用

### 根据之前的状态更新状态

要根据先前的状态更新状态，我们应该使用更新器函数。在[这里](https://react.dev/learn/queueing-a-series-of-state-updates)阅读更多相关内容。

此示例展示了如何在操作中支持更新程序功能。

```tsx
import { createWithEqualityFn } from 'zustand/traditional'
import { shallow } from 'zustand/vanilla/shallow'

type AgeStoreState = { age: number }

type AgeStoreActions = {
  setAge: (
    nextAge:
      | AgeStoreState['age']
      | ((currentAge: AgeStoreState['age']) => AgeStoreState['age']),
  ) => void
}

type AgeStore = AgeStoreState & AgeStoreActions

const useAgeStore = createWithEqualityFn<AgeStore>()(
  (set) => ({
    age: 42,
    setAge: (nextAge) =>
      set((state) => ({
        age: typeof nextAge === 'function' ? nextAge(state.age) : nextAge,
      })),
  }),
  shallow,
)

export default function App() {
  const age = useAgeStore((state) => state.age)
  const setAge = useAgeStore((state) => state.setAge)

  function increment() {
    setAge((currentAge) => currentAge + 1)
  }

  return (
    <>
      <h1>Your age: {age}</h1>
      <button
        type="button"
        onClick={() => {
          increment()
          increment()
          increment()
        }}
      >
        +3
      </button>
      <button
        type="button"
        onClick={() => {
          increment()
        }}
      >
        +1
      </button>
    </>
  )
}
```

### 更新状态中的原始值

状态可以保存任何类型的 JavaScript 值。当您想要更新数字、字符串、布尔值等内置原始值时，您应该直接分配新值以确保正确应用更新，并避免意外行为。

:::tip
默认情况下，set 函数执行浅合并。如果需要将状态完全替换为新状态，请使用设置为true的replace参数
:::

```tsx
import { createWithEqualityFn } from 'zustand/traditional'
import { shallow } from 'zustand/vanilla/shallow'

type XStore = number

const useXStore = createWithEqualityFn<XStore>()(() => 0, shallow)

export default function MovingDot() {
  const x = useXStore()
  const setX = (nextX: number) => {
    useXStore.setState(nextX, true)
  }
  const position = { y: 0, x }

  return (
    <div
      onPointerMove={(e) => {
        setX(e.clientX)
      }}
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
      }}
    >
      <div
        style={{
          position: 'absolute',
          backgroundColor: 'red',
          borderRadius: '50%',
          transform: `translate(${position.x}px, ${position.y}px)`,
          left: -10,
          top: -10,
          width: 20,
          height: 20,
        }}
      />
    </div>
  )
}
```

### 更新状态中的对象

对象在 JavaScript 中是可变的，但是当您将它们存储在状态中时，应该将它们视为不可变。相反，当您想要更新对象时，您需要创建一个新对象（或复制现有对象），然后设置状态以使用新对象。

默认情况下，`set` 函数执行浅合并。对于大多数只需要修改特定属性的更新，默认的浅合并是首选，因为它更有效。要将状态完全替换为新状态，请谨慎使用设置为 `true` 的`replace` 参数，因为它会丢弃状态中任何现有的嵌套数据。

```tsx
import { createWithEqualityFn } from 'zustand/traditional'
import { shallow } from 'zustand/vanilla/shallow'

type PositionStoreState = { position: { x: number; y: number } }

type PositionStoreActions = {
  setPosition: (nextPosition: PositionStoreState['position']) => void
}

type PositionStore = PositionStoreState & PositionStoreActions

const usePositionStore = createWithEqualityFn<PositionStore>()(
  (set) => ({
    position: { x: 0, y: 0 },
    setPosition: (position) => set({ position }),
  }),
  shallow,
)

export default function MovingDot() {
  const position = usePositionStore((state) => state.position)
  const setPosition = usePositionStore((state) => state.setPosition)

  return (
    <div
      onPointerMove={(e) => {
        setPosition({
          x: e.clientX,
          y: e.clientY,
        })
      }}
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
      }}
    >
      <div
        style={{
          position: 'absolute',
          backgroundColor: 'red',
          borderRadius: '50%',
          transform: `translate(${position.x}px, ${position.y}px)`,
          left: -10,
          top: -10,
          width: 20,
          height: 20,
        }}
      />
    </div>
  )
}
```

### 更新状态中的数组

数组在 JavaScript 中是可变的，但是当您将它们存储在状态中时，应该将它们视为不可变。就像对象一样，当您想要更新存储在状态中的数组时，您需要创建一个新数组（或复制现有数组），然后设置状态以使用新数组。

默认情况下，`set` 函数执行浅合并。要更新数组值，我们应该分配新值以确保正确应用更新，并避免意外行为。要将状态完全替换为新状态，请使用设置为 `true` 的`replace` 参数。

:::tip
我们应该更喜欢不可变的操作，例如：`[...array]`、`concat(...)`、`filter(...)`、`slice(...)`、`map(...)`、`toSpliced(...)`、`toSorted (...)` 和 `toReversed(...)`，并避免可变操作，如 `array[arrayIndex] = ...`、`push(...)`、`unshift(...)`、`pop(...)`、`shift (...)`、`splice(...)`、`reverse(...)` 和`sort(...)`。
:::

```tsx
import { createWithEqualityFn } from 'zustand/traditional'
import { shallow } from 'zustand/vanilla/shallow'

type PositionStore = [number, number]

const usePositionStore = createWithEqualityFn<PositionStore>()(
  () => [0, 0],
  shallow,
)

export default function MovingDot() {
  const [x, y] = usePositionStore()
  const position = { x, y }
  const setPosition: typeof usePositionStore.setState = (nextPosition) => {
    usePositionStore.setState(nextPosition, true)
  }

  return (
    <div
      onPointerMove={(e) => {
        setPosition([e.clientX, e.clientY])
      }}
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
      }}
    >
      <div
        style={{
          position: 'absolute',
          backgroundColor: 'red',
          borderRadius: '50%',
          transform: `translate(${position.x}px, ${position.y}px)`,
          left: -10,
          top: -10,
          width: 20,
          height: 20,
        }}
      />
    </div>
  )
}
```

### 在没有存储操作的情况下更新状态

在存储外部的模块级别定义操作有一些优点，例如：不需要钩子来调用操作，并且有利于代码分割。

:::tip
推荐的方法是在store内并置操作和状态（让您的操作与状态一起定位）。
:::

```tsx
import { createWithEqualityFn } from 'zustand/traditional'
import { shallow } from 'zustand/vanilla/shallow'

const usePositionStore = createWithEqualityFn<{
  x: number
  y: number
}>()(() => ({ x: 0, y: 0 }), shallow)

const setPosition: typeof usePositionStore.setState = (nextPosition) => {
  usePositionStore.setState(nextPosition)
}

export default function MovingDot() {
  const position = usePositionStore()

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
      }}
    >
      <div
        style={{
          position: 'absolute',
          backgroundColor: 'red',
          borderRadius: '50%',
          transform: `translate(${position.x}px, ${position.y}px)`,
          left: -10,
          top: -10,
          width: 20,
          height: 20,
        }}
        onMouseEnter={(event) => {
          const parent = event.currentTarget.parentElement
          const parentWidth = parent.clientWidth
          const parentHeight = parent.clientHeight

          setPosition({
            x: Math.ceil(Math.random() * parentWidth),
            y: Math.ceil(Math.random() * parentHeight),
          })
        }}
      />
    </div>
  )
}
```

### 订阅状态更新

通过订阅状态更新，您可以注册一个回调，每当商店的状态更新时就会触发该回调。我们可以使用 `subscribe` 进行外部状态管理。

```tsx
import { useEffect } from 'react'
import { createWithEqualityFn } from 'zustand/traditional'
import { shallow } from 'zustand/vanilla/shallow'

type PositionStoreState = { position: { x: number; y: number } }

type PositionStoreActions = {
  setPosition: (nextPosition: PositionStoreState['position']) => void
}

type PositionStore = PositionStoreState & PositionStoreActions

const usePositionStore = createWithEqualityFn<PositionStore>()(
  (set) => ({
    position: { x: 0, y: 0 },
    setPosition: (nextPosition) => set(nextPosition),
  }),
  shallow,
)

export default function MovingDot() {
  const position = usePositionStore((state) => state.position)
  const setPosition = usePositionStore((state) => state.setPosition)

  useEffect(() => {
    const unsubscribePositionStore = usePositionStore.subscribe(
      ({ position }) => {
        console.log('new position', { position })
      },
    )

    return () => {
      unsubscribePositionStore()
    }
  }, [])

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
      }}
    >
      <div
        style={{
          position: 'absolute',
          backgroundColor: 'red',
          borderRadius: '50%',
          transform: `translate(${position.x}px, ${position.y}px)`,
          left: -10,
          top: -10,
          width: 20,
          height: 20,
        }}
        onMouseEnter={(event) => {
          const parent = event.currentTarget.parentElement
          const parentWidth = parent.clientWidth
          const parentHeight = parent.clientHeight

          setPosition({
            x: Math.ceil(Math.random() * parentWidth),
            y: Math.ceil(Math.random() * parentHeight),
          })
        }}
      />
    </div>
  )
}
```

## 故障排除

### 我已更新状态，但屏幕未更新

在前面的示例中，`position` 对象始终是从当前光标位置重新创建的。但通常，您会希望将现有数据作为您正在创建的新对象的一部分包含在内。例如，您可能只想更新表单中的一个字段，但保留所有其他字段的先前值。

这些输入字段不起作用，因为 `onChange` 处理程序会改变状态：

```tsx
import { createWithEqualityFn } from 'zustand/traditional'
import { shallow } from 'zustand/vanilla/shallow'

type PersonStoreState = {
  person: { firstName: string; lastName: string; email: string }
}

type PersonStoreActions = {
  setPerson: (nextPerson: PersonStoreState['person']) => void
}

type PersonStore = PersonStoreState & PersonStoreActions

const usePersonStore = createWithEqualityFn<PersonStore>()(
  (set) => ({
    person: {
      firstName: 'Barbara',
      lastName: 'Hepworth',
      email: 'bhepworth@sculpture.com',
    },
    setPerson: (person) => set({ person }),
  }),
  shallow,
)

export default function Form() {
  const person = usePersonStore((state) => state.person)
  const setPerson = usePersonStore((state) => state.setPerson)

  function handleFirstNameChange(e: ChangeEvent<HTMLInputElement>) {
    person.firstName = e.target.value
  }

  function handleLastNameChange(e: ChangeEvent<HTMLInputElement>) {
    person.lastName = e.target.value
  }

  function handleEmailChange(e: ChangeEvent<HTMLInputElement>) {
    person.email = e.target.value
  }

  return (
    <>
      <label style={{ display: 'block' }}>
        First name:
        <input value={person.firstName} onChange={handleFirstNameChange} />
      </label>
      <label style={{ display: 'block' }}>
        Last name:
        <input value={person.lastName} onChange={handleLastNameChange} />
      </label>
      <label style={{ display: 'block' }}>
        Email:
        <input value={person.email} onChange={handleEmailChange} />
      </label>
      <p>
        {person.firstName} {person.lastName} ({person.email})
      </p>
    </>
  )
}
```

例如，这一行改变了过去渲染的状态：

```tsx
person.firstName = e.target.value
```

获得您正在寻找的行为的可靠方法是创建一个新对象并将其传递给 `setPerson`。但在这里您还想将现有数据复制到其中，因为只有一个字段发生了更改：

```ts
setPerson({ ...person, firstName: e.target.value }) // New first name from the input
```

:::tip
由于 set 函数默认执行浅层合并，因此我们不需要单独复制每个属性。
:::

现在表单可以工作了！

请注意，您没有为每个输入字段声明单独的状态变量。对于大型表单，将所有数据分组在一个对象中非常方便 - 只要正确更新即可！

```tsx {32,36,40}
import { type ChangeEvent } from 'react'
import { createWithEqualityFn } from 'zustand/traditional'
import { shallow } from 'zustand/vanilla/shallow'

type PersonStoreState = {
  person: { firstName: string; lastName: string; email: string }
}

type PersonStoreActions = {
  setPerson: (nextPerson: PersonStoreState['person']) => void
}

type PersonStore = PersonStoreState & PersonStoreActions

const usePersonStore = createWithEqualityFn<PersonStore>()(
  (set) => ({
    person: {
      firstName: 'Barbara',
      lastName: 'Hepworth',
      email: 'bhepworth@sculpture.com',
    },
    setPerson: (nextPerson) => set({ person: nextPerson }),
  }),
  shallow,
)

export default function Form() {
  const person = usePersonStore((state) => state.person)
  const setPerson = usePersonStore((state) => state.setPerson)

  function handleFirstNameChange(e: ChangeEvent<HTMLInputElement>) {
    setPerson({ ...person, firstName: e.target.value })
  }

  function handleLastNameChange(e: ChangeEvent<HTMLInputElement>) {
    setPerson({ ...person, lastName: e.target.value })
  }

  function handleEmailChange(e: ChangeEvent<HTMLInputElement>) {
    setPerson({ ...person, email: e.target.value })
  }

  return (
    <>
      <label style={{ display: 'block' }}>
        First name:
        <input value={person.firstName} onChange={handleFirstNameChange} />
      </label>
      <label style={{ display: 'block' }}>
        Last name:
        <input value={person.lastName} onChange={handleLastNameChange} />
      </label>
      <label style={{ display: 'block' }}>
        Email:
        <input value={person.email} onChange={handleEmailChange} />
      </label>
      <p>
        {person.firstName} {person.lastName} ({person.email})
      </p>
    </>
  )
}
```
