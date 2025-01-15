---
title: useShallow ⚛️
description: useShallow 是一个 React Hook，可让您优化重新渲染。
nav: 28
---

`useShallow` 是一个 React Hook，可让您优化重新渲染。

```js
const memoizedSelector = useShallow(selector)
```

### 签名

```ts
useShallow<T, U = T>(selectorFn: (state: T) => U): (state: T) => U
```

## 语法

### `useShallow(selectorFn)`

#### 参数

- `selectorFn`: 一个可让您返回基于当前状态的数据的函数。

#### 返回

`useShallow`：useShallow 使用浅比较进行记忆化，返回选择器函数的记忆化版本。

## 用法

### 编写记忆选择器

首先，我们需要建立一个商店来保存熊家族的状态。在这家商店中，我们定义了三个属性：`papaBear`、`mamaBear` 和 `BabyBear`，每个属性代表熊家族的不同成员及其各自的燕麦罐尺寸。

```tsx
import { create } from 'zustand'

type BearFamilyMealsStore = {
  [key: string]: string
}

const useBearFamilyMealsStore = create<BearFamilyMealsStore>()(() => ({
  papaBear: 'large porridge-pot',
  mamaBear: 'middle-size porridge pot',
  babyBear: 'A little, small, wee pot',
}))
```

接下来，我们将创建一个 `BearNames` 组件，用于检索状态（熊家族成员）的键并显示它们。

```tsx
function BearNames() {
  const names = useBearFamilyMealsStore((state) => Object.keys(state))

  return <div>{names.join(', ')}</div>
}
```

接下来，我们将创建一个 U`pdateBabyBearMeal` 组件，定期更新小熊的膳食选择。


```tsx
const meals = [
  'A tiny, little, wee bowl',
  'A small, petite, tiny pot',
  'A wee, itty-bitty, small bowl',
  'A little, petite, tiny dish',
  'A tiny, small, wee vessel',
  'A small, little, wee cauldron',
  'A little, tiny, small cup',
  'A wee, small, little jar',
  'A tiny, wee, small pan',
  'A small, wee, little crock',
]

function UpdateBabyBearMeal() {
  useEffect(() => {
    const timer = setInterval(() => {
      useBearFamilyMealsStore.setState({
        tinyBear: meals[Math.floor(Math.random() * (meals.length - 1))],
      })
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [])

  return null
}
```

最后，我们将这两个组件组合到 `App` 组件中以查看它们的运行情况。

```tsx
export default function App() {
  return (
    <>
      <UpdateTinyBearPorridge />
      <BearNames />
    </>
  )
}
```

代码应如下所示：

```tsx
import { useEffect } from 'react'
import { create } from 'zustand'

type BearFamilyMealsStore = {
  [key: string]: string
}

const useBearFamilyMealsStore = create<BearFamilyMealsStore>()(() => ({
  papaBear: 'large porridge-pot',
  mamaBear: 'middle-size porridge pot',
  babyBear: 'A little, small, wee pot',
}))

const meals = [
  'A tiny, little, wee bowl',
  'A small, petite, tiny pot',
  'A wee, itty-bitty, small bowl',
  'A little, petite, tiny dish',
  'A tiny, small, wee vessel',
  'A small, little, wee cauldron',
  'A little, tiny, small cup',
  'A wee, small, little jar',
  'A tiny, wee, small pan',
  'A small, wee, little crock',
]

function UpdateBabyBearMeal() {
  useEffect(() => {
    const timer = setInterval(() => {
      useBearFamilyMealsStore.setState({
        tinyBear: meals[Math.floor(Math.random() * (meals.length - 1))],
      })
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [])

  return null
}

function BearNames() {
  const names = useBearFamilyMealsStore((state) => Object.keys(state))

  return <div>{names.join(', ')}</div>
}

export default function App() {
  return (
    <>
      <UpdateBabyBearMeal />
      <BearNames />
    </>
  )
}
```

一切看起来都很好，但有一个小问题：即使名称没有更改，`BearNames` 组件也会不断重新渲染。发生这种情况是因为只要状态的任何部分发生变化，即使我们关心的特定部分（名称列表）没有改变，组件也会重新渲染。

为了解决这个问题，我们使用 `useShallow` 来确保组件仅在状态的实际键发生变化时重新渲染：

```tsx
function BearNames() {
  const names = useBearFamilyStore(useShallow((state) => Object.keys(state)))

  return <div>{names.join(', ')}</div>
}
```

代码应如下所示：

```tsx
import { useEffect } from 'react'
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

type BearFamilyMealsStore = {
  [key: string]: string
}

const useBearFamilyMealsStore = create<BearFamilyMealsStore>()(() => ({
  papaBear: 'large porridge-pot',
  mamaBear: 'middle-size porridge pot',
  babyBear: 'A little, small, wee pot',
}))

const meals = [
  'A tiny, little, wee bowl',
  'A small, petite, tiny pot',
  'A wee, itty-bitty, small bowl',
  'A little, petite, tiny dish',
  'A tiny, small, wee vessel',
  'A small, little, wee cauldron',
  'A little, tiny, small cup',
  'A wee, small, little jar',
  'A tiny, wee, small pan',
  'A small, wee, little crock',
]

function UpdateBabyBearMeal() {
  useEffect(() => {
    const timer = setInterval(() => {
      useBearFamilyMealsStore.setState({
        tinyBear: meals[Math.floor(Math.random() * (meals.length - 1))],
      })
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [])

  return null
}

function BearNames() {
  const names = useBearFamilyMealsStore(
    useShallow((state) => Object.keys(state)),
  )

  return <div>{names.join(', ')}</div>
}

export default function App() {
  return (
    <>
      <UpdateBabyBearMeal />
      <BearNames />
    </>
  )
}
```

通过使用 `useShallow`，我们优化了渲染过程，确保组件仅在必要时重新渲染，从而提高了整体性能。

## Troubleshooting

TBD
