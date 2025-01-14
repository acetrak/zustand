---
title: 更新状态
nav: 2
---

## 平面更新


使用 Zustand 更新状态非常简单！使用新状态调用提供的 `set` 函数，它将与存储中的现有状态浅层合并。 **注意** 请参阅下一节了解嵌套状态。

```tsx
import { create } from 'zustand'

type State = {
  firstName: string
  lastName: string
}

type Action = {
  updateFirstName: (firstName: State['firstName']) => void
  updateLastName: (lastName: State['lastName']) => void
}

// Create your store, which includes both state and (optionally) actions
const usePersonStore = create<State & Action>((set) => ({
  firstName: '',
  lastName: '',
  updateFirstName: (firstName) => set(() => ({ firstName: firstName })),
  updateLastName: (lastName) => set(() => ({ lastName: lastName })),
}))

// In consuming app
function App() {
  // "select" the needed state and actions, in this case, the firstName value
  // and the action updateFirstName
  const firstName = usePersonStore((state) => state.firstName)
  const updateFirstName = usePersonStore((state) => state.updateFirstName)

  return (
    <main>
      <label>
        First name
        <input
          // Update the "firstName" state
          onChange={(e) => updateFirstName(e.currentTarget.value)}
          value={firstName}
        />
      </label>

      <p>
        Hello, <strong>{firstName}!</strong>
      </p>
    </main>
  )
}
```

## 深度嵌套对象​

如果你有一个像这样的深度状态对象：

```ts
type State = {
  deep: {
    nested: {
      obj: { count: number }
    }
  }
}
```

更新嵌套状态需要付出一些努力才能确保该过程一成不变地完成。

### 正常方法​

与 React 或 Redux 类似，正常的方法是复制状态对象的每个级别。这是通过扩展运算符 `...` 并通过手动将其与新状态值合并来完成的。就像这样：

```ts
  normalInc: () =>
    set((state) => ({
      deep: {
        ...state.deep,
        nested: {
          ...state.deep.nested,
          obj: {
            ...state.deep.nested.obj,
            count: state.deep.nested.obj.count + 1
          }
        }
      }
    })),
```

这很长！让我们探索一些可以让您的生活更轻松的替代方案。

### 配合Immer使用


许多人使用 Immer 来更新嵌套值。 [Immer](https://github.com/immerjs/immer)  可以在您需要更新嵌套状态的任何时候使用，例如在 React、Redux，当然还有 Zustand 中！

您可以使用 Immer 来缩短深度嵌套对象的状态更新。让我们看一个例子：


```ts
  immerInc: () =>
    set(produce((state: State) => { ++state.deep.nested.obj.count })),
```


减少多少啊！请注意此处列出的[问题](../integrations/immer-middleware.md)。

### 配合optics-ts使用


[optics-ts](https://github.com/akheron/optics-ts/) 还有另一种选择：

```ts
  opticsInc: () =>
    set(O.modify(O.optic<State>().path("deep.nested.obj.count"))((c) => c + 1)),
```

与 Immer 不同，optics-ts 不使用代理或突变语法。

### 配合Ramda使用


您还可以使用 [Ramda](https://ramdajs.com/)

```ts
  ramdaInc: () =>
    set(R.modifyPath(["deep", "nested", "obj", "count"], (c) => c + 1)),
```

ramda 和 optics-ts 也适用于类型。

### CodeSandbox 演示​

https://codesandbox.io/s/zustand-normal-immer-optics-ramda-updating-ynn3o?file=/src/App.tsx
