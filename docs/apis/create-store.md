---
title: createStore
description: 如何创建vanilla stores
nav: 24
---

`createStore` 允许您创建一个公开的vanilla store API 实用程序。

```js
const someStore = createStore(stateCreatorFn)
```

## 类型

### 签名

```ts
createStore<T>()(stateCreatorFn: StateCreator<T, [], []>): StoreApi<T>
```

## 语法

### `createStore(stateCreatorFn)`

#### 参数

- `stateCreatorFn`：一个以 `set` 函数、`get` 函数和 `store` 作为参数的函数。通常，您将返回一个带有您想要公开的方法的对象。

#### 返回

`createStore` 返回一个公开 API 实用程序、`setState`、`getState`、`getInitialState` 和 `subscribe` 的普通存储。

## 使用

### 根据之前的状态更新状态

此示例展示了如何在操作中支持更新程序功能。

```tsx
import { createStore } from 'zustand/vanilla'

type AgeStoreState = { age: number }

type AgeStoreActions = {
  setAge: (
    nextAge:
      | AgeStoreState['age']
      | ((currentAge: AgeStoreState['age']) => AgeStoreState['age']),
  ) => void
}

type AgeStore = AgeStoreState & AgeStoreActions

const ageStore = createStore<AgeStore>()((set) => ({
  age: 42,
  setAge: (nextAge) =>
    set((state) => ({
      age: typeof nextAge === 'function' ? nextAge(state.age) : nextAge,
    })),
}))

function increment() {
  ageStore.getState().setAge((currentAge) => currentAge + 1)
}

const $yourAgeHeading = document.getElementById(
  'your-age',
) as HTMLHeadingElement
const $incrementBy3Button = document.getElementById(
  'increment-by-3',
) as HTMLButtonElement
const $incrementBy1Button = document.getElementById(
  'increment-by-1',
) as HTMLButtonElement

$incrementBy3Button.addEventListener('click', () => {
  increment()
  increment()
  increment()
})

$incrementBy1Button.addEventListener('click', () => {
  increment()
})

const render: Parameters<typeof ageStore.subscribe>[0] = (state) => {
  $yourAgeHeading.innerHTML = `Your age: ${state.age}`
}

render(ageStore.getInitialState(), ageStore.getInitialState())

ageStore.subscribe(render)
```

这是`html`代码

```html
<h1 id="your-age"></h1>
<button id="increment-by-3" type="button">+3</button>
<button id="increment-by-1" type="button">+1</button>
```

### 更新状态中的原始值

状态可以保存任何类型的 JavaScript 值。当您想要更新数字、字符串、布尔值等内置原始值时，您应该直接分配新值以确保正确应用更新，并避免意外行为。

:::tip
默认情况下，`set` 函数执行浅合并。如果需要将状态完全替换为新状态，请使用设置为`true`的`replace`参数
:::

```ts
import { createStore } from 'zustand/vanilla'

type XStore = number

const xStore = createStore<XStore>()(() => 0)

const $dotContainer = document.getElementById('dot-container') as HTMLDivElement
const $dot = document.getElementById('dot') as HTMLDivElement

$dotContainer.addEventListener('pointermove', (event) => {
  xStore.setState(event.clientX, true)
})

const render: Parameters<typeof xStore.subscribe>[0] = (x) => {
  $dot.style.transform = `translate(${x}px, 0)`
}

render(xStore.getInitialState(), xStore.getInitialState())

xStore.subscribe(render)
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

### 更新状态中的对象

对象在 JavaScript 中是可变的，但是当您将它们存储在状态中时，应该将它们视为不可变。相反，当您想要更新对象时，您需要创建一个新对象（或复制现有对象），然后设置状态以使用新对象。

默认情况下，`set` 函数执行浅合并。对于大多数只需要修改特定属性的更新，默认的浅合并是首选，因为它更有效。要将状态完全替换为新状态，请谨慎使用设置为 `true` 的`replace`参数，因为它会丢弃状态中任何现有的嵌套数据。

```ts
import { createStore } from 'zustand/vanilla'

type PositionStoreState = { position: { x: number; y: number } }

type PositionStoreActions = {
  setPosition: (nextPosition: PositionStoreState['position']) => void
}

type PositionStore = PositionStoreState & PositionStoreActions

const positionStore = createStore<PositionStore>()((set) => ({
  position: { x: 0, y: 0 },
  setPosition: (position) => set({ position }),
}))

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

render(positionStore.getInitialState(), positionStore.getInitialState())

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

### 更新状态中的数组

数组在 JavaScript 中是可变的，但是当您将它们存储在状态中时，应该将它们视为不可变。就像对象一样，当您想要更新存储在状态中的数组时，您需要创建一个新数组（或复制现有数组），然后设置状态以使用新数组。

默认情况下，`set` 函数执行浅合并。要更新数组值，我们应该分配新值以确保正确应用更新，并避免意外行为。要将状态完全替换为新状态，请使用设置为 `true` 的`replace` 参数。

:::tip
我们应该更喜欢不可变的操作，例如：`[...array]`、`concat(...)`、`filter(...)`、`slice(...)`、`map(...)`、`toSpliced(...)`、`toSorted (...)` 和 `toReversed(...)`，并避免可变操作，如 `array[arrayIndex] = ...`、`push(...)`、`unshift(...)`、`pop(...)`、`shift (...)`、`splice(...)`、`reverse(...)` 和`sort(...)`。
:::

```ts
import { createStore } from 'zustand/vanilla'

type PositionStore = [number, number]

const positionStore = createStore<PositionStore>()(() => [0, 0])

const $dotContainer = document.getElementById('dot-container') as HTMLDivElement
const $dot = document.getElementById('dot') as HTMLDivElement

$dotContainer.addEventListener('pointermove', (event) => {
  positionStore.setState([event.clientX, event.clientY], true)
})

const render: Parameters<typeof positionStore.subscribe>[0] = ([x, y]) => {
  $dot.style.transform = `translate(${x}px, ${y}px)`
}

render(positionStore.getInitialState(), positionStore.getInitialState())

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

### 订阅状态更新

通过订阅状态更新，您可以注册一个回调，每当商店的状态更新时就会触发该回调。我们可以使用 `subscribe` 进行外部状态管理。.

```ts
import { createStore } from 'zustand/vanilla'

type PositionStoreState = { position: { x: number; y: number } }

type PositionStoreActions = {
  setPosition: (nextPosition: PositionStoreState['position']) => void
}

type PositionStore = PositionStoreState & PositionStoreActions

const positionStore = createStore<PositionStore>()((set) => ({
  position: { x: 0, y: 0 },
  setPosition: (position) => set({ position }),
}))

const $dot = document.getElementById('dot') as HTMLDivElement

$dot.addEventListener('mouseenter', (event) => {
  const parent = event.currentTarget.parentElement
  const parentWidth = parent.clientWidth
  const parentHeight = parent.clientHeight

  positionStore.getState().setPosition({
    x: Math.ceil(Math.random() * parentWidth),
    y: Math.ceil(Math.random() * parentHeight),
  })
})

const render: Parameters<typeof positionStore.subscribe>[0] = (state) => {
  $dot.style.transform = `translate(${state.position.x}px, ${state.position.y}px)`
}

render(positionStore.getInitialState(), positionStore.getInitialState())

positionStore.subscribe(render)

const logger: Parameters<typeof positionStore.subscribe>[0] = (state) => {
  console.log('new position', { position: state.position })
}

positionStore.subscribe(logger)
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

## 故障排除

### 我已更新状态，但屏幕未更新

在前面的示例中，`position`对象始终是从当前光标位置重新创建的。但通常，您会希望将现有数据作为您正在创建的新对象的一部分包含在内。例如，您可能只想更新表单中的一个字段，但保留所有其他字段的先前值。

这些输入字段不起作用，因为 `oninput` 处理程序会改变状态：

```ts
import { createStore } from 'zustand/vanilla'

type PersonStoreState = {
  person: { firstName: string; lastName: string; email: string }
}

type PersonStoreActions = {
  setPerson: (nextPerson: PersonStoreState['person']) => void
}

type PersonStore = PersonStoreState & PersonStoreActions

const personStore = createStore<PersonStore>()((set) => ({
  person: {
    firstName: 'Barbara',
    lastName: 'Hepworth',
    email: 'bhepworth@sculpture.com',
  },
  setPerson: (person) => set({ person }),
}))

const $firstNameInput = document.getElementById(
  'first-name',
) as HTMLInputElement
const $lastNameInput = document.getElementById('last-name') as HTMLInputElement
const $emailInput = document.getElementById('email') as HTMLInputElement
const $result = document.getElementById('result') as HTMLDivElement

function handleFirstNameChange(event: Event) {
  personStore.getState().person.firstName = (event.target as any).value
}

function handleLastNameChange(event: Event) {
  personStore.getState().person.lastName = (event.target as any).value
}

function handleEmailChange(event: Event) {
  personStore.getState().person.email = (event.target as any).value
}

$firstNameInput.addEventListener('input', handleFirstNameChange)
$lastNameInput.addEventListener('input', handleLastNameChange)
$emailInput.addEventListener('input', handleEmailChange)

const render: Parameters<typeof personStore.subscribe>[0] = (state) => {
  $firstNameInput.value = state.person.firstName
  $lastNameInput.value = state.person.lastName
  $emailInput.value = state.person.email

  $result.innerHTML = `${state.person.firstName} ${state.person.lastName} (${state.person.email})`
}

render(personStore.getInitialState(), personStore.getInitialState())

personStore.subscribe(render)
```

这是`html`代码

```html
<label style="display: block">
  First name:
  <input id="first-name" />
</label>
<label style="display: block">
  Last name:
  <input id="last-name" />
</label>
<label style="display: block">
  Email:
  <input id="email" />
</label>
<p id="result"></p>
```

例如，这一行改变了过去渲染的状态：

```ts
personStore.getState().firstName = (e.target as any).value
```

获得您正在寻找的行为的可靠方法是创建一个新对象并将其传递给 `setPerson`。但在这里您还想将现有数据复制到其中，因为只有一个字段发生了更改：

```ts
personStore.getState().setPerson({
  firstName: e.target.value, // New first name from the input
})
```

:::tip
由于 `set` 函数默认执行浅层合并，因此我们不需要单独复制每个属性。
:::

现在表单可以工作了！

请注意，您没有为每个输入字段声明单独的状态变量。对于大型表单，将所有数据分组在一个对象中非常方便 - 只要正确更新即可！

```ts {32-34,38-40,44-46}
import { createStore } from 'zustand/vanilla'

type PersonStoreState = {
  person: { firstName: string; lastName: string; email: string }
}

type PersonStoreActions = {
  setPerson: (nextPerson: PersonStoreState['person']) => void
}

type PersonStore = PersonStoreState & PersonStoreActions

const personStore = createStore<PersonStore>()((set) => ({
  person: {
    firstName: 'Barbara',
    lastName: 'Hepworth',
    email: 'bhepworth@sculpture.com',
  },
  setPerson: (person) => set({ person }),
}))

const $firstNameInput = document.getElementById(
  'first-name',
) as HTMLInputElement
const $lastNameInput = document.getElementById('last-name') as HTMLInputElement
const $emailInput = document.getElementById('email') as HTMLInputElement
const $result = document.getElementById('result') as HTMLDivElement

function handleFirstNameChange(event: Event) {
  personStore.getState().setPerson({
    ...personStore.getState().person,
    firstName: (event.target as any).value,
  })
}

function handleLastNameChange(event: Event) {
  personStore.getState().setPerson({
    ...personStore.getState().person,
    lastName: (event.target as any).value,
  })
}

function handleEmailChange(event: Event) {
  personStore.getState().setPerson({
    ...personStore.getState().person,
    email: (event.target as any).value,
  })
}

$firstNameInput.addEventListener('input', handleFirstNameChange)
$lastNameInput.addEventListener('input', handleLastNameChange)
$emailInput.addEventListener('input', handleEmailChange)

const render: Parameters<typeof personStore.subscribe>[0] = (state) => {
  $firstNameInput.value = state.person.firstName
  $lastNameInput.value = state.person.lastName
  $emailInput.value = state.person.email

  $result.innerHTML = `${state.person.firstName} ${state.person.lastName} (${state.person.email})`
}

render(personStore.getInitialState(), personStore.getInitialState())

personStore.subscribe(render)
```
