---
title: 在 React 18 之前的 React 事件处理程序之外调用操作
nav: 9
---

因为如果在事件处理程序外部调用 `setState`，React 会同步处理 setState，所以在事件处理程序外部更新状态将强制 React 同步更新组件。因此，存在遭遇“僵尸儿童效应”的风险。为了解决这个问题，该操作需要包装在`unstable_batchedUpdates`中，如下所示：

```jsx
import { unstable_batchedUpdates } from 'react-dom' // or 'react-native'

const useFishStore = create((set) => ({
  fishes: 0,
  increaseFishes: () => set((prev) => ({ fishes: prev.fishes + 1 })),
}))

const nonReactCallback = () => {
  unstable_batchedUpdates(() => {
    useFishStore.getState().increaseFishes()
  })
}
```

更多详细信息: https://github.com/pmndrs/zustand/issues/302
