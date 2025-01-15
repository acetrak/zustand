---
title: 使用 useShallow 防止重新渲染
nav: 15
---

当您需要从store订阅计算状态时，推荐的方法是使用选择器。

如果输出根据 [Object.is](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is?retiredLocale=it) 发生更改，计算选择器将导致重新渲染。

在这种情况下，如果计算值始终浅等于前一个值，您可能希望使用 `useShallow` 来避免重新渲染

## 例子

我们有一个store ，我们想呈现他们的名字。

```js
import { create } from 'zustand'

const useMeals = create(() => ({
  papaBear: 'large porridge-pot',
  mamaBear: 'middle-size porridge pot',
  littleBear: 'A little, small, wee pot',
}))

export const BearNames = () => {
  const names = useMeals((state) => Object.keys(state))

  return <div>{names.join(', ')}</div>
}
```

现在熊爸爸想要一份披萨：

```js
useMeals.setState({
  papaBear: 'a large pizza',
})
```

即使`names`的实际输出没有根据浅相等发生变化，此更改也会导致 `BearNames` 重新渲染。

我们可以使用 `useShallow` 来解决这个问题！

```js
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

const useMeals = create(() => ({
  papaBear: 'large porridge-pot',
  mamaBear: 'middle-size porridge pot',
  littleBear: 'A little, small, wee pot',
}))

export const BearNames = () => {
  const names = useMeals(useShallow((state) => Object.keys(state)))

  return <div>{names.join(', ')}</div>
}
```

现在，他们都可以订购其他餐点，而不会导致我们的 `BearNames` 组件不必要的重新渲染。
