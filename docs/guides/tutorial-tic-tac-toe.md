---
title: 教程：井字游戏
description: 构建一个井字游戏
nav: 0
---

# 教程：井字游戏

## 构建一个井字游戏

在本教程中，您将构建一个小型井字游戏。本教程假设现有的 React 知识。您将在本教程中学习的技术是构建任何 React 应用程序的基础，充分理解它将使您对 React 和 Zustand 有深入的了解。

:::tip
本教程是为那些通过实践经验学习得最好并希望快速创建有形东西的人而设计的
它从 React 的 tic-tac-toe 教程中汲取灵感。
:::

本教程分为几个部分：

- 本教程的设置将为您提供学习本教程的起点。
- 概述将教您 React 的基础知识：组件、道具和状态。
- 完成游戏将教你 React 开发中最常见的技术。
- 添加时间旅行将使您更深入地了解 React 的独特优势。

### 你在建造什么？​

在本教程中，您将使用 React 和 Zustand 构建一个交互式井字棋游戏。

您可以在此处看到完成后的样子：

```jsx
import { create } from 'zustand'
import { combine } from 'zustand/middleware'

const useGameStore = create(
  combine(
    {
      history: [Array(9).fill(null)],
      currentMove: 0,
    },
    (set, get) => {
      return {
        setHistory: (nextHistory) => {
          set((state) => ({
            history:
              typeof nextHistory === 'function'
                ? nextHistory(state.history)
                : nextHistory,
          }))
        },
        setCurrentMove: (nextCurrentMove) => {
          set((state) => ({
            currentMove:
              typeof nextCurrentMove === 'function'
                ? nextCurrentMove(state.currentMove)
                : nextCurrentMove,
          }))
        },
      }
    },
  ),
)

function Square({ value, onSquareClick }) {
  return (
    <button
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        backgroundColor: '#fff',
        border: '1px solid #999',
        outline: 0,
        borderRadius: 0,
        fontSize: '1rem',
        fontWeight: 'bold',
      }}
      onClick={onSquareClick}
    >
      {value}
    </button>
  )
}

function Board({ xIsNext, squares, onPlay }) {
  const winner = calculateWinner(squares)
  const turns = calculateTurns(squares)
  const player = xIsNext ? 'X' : 'O'
  const status = calculateStatus(winner, turns, player)

  function handleClick(i) {
    if (squares[i] || winner) return
    const nextSquares = squares.slice()
    nextSquares[i] = player
    onPlay(nextSquares)
  }

  return (
    <>
      <div style={{ marginBottom: '0.5rem' }}>{status}</div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'repeat(3, 1fr)',
          width: 'calc(3 * 2.5rem)',
          height: 'calc(3 * 2.5rem)',
          border: '1px solid #999',
        }}
      >
        {squares.map((_, i) => (
          <Square
            key={`square-${i}`}
            value={squares[i]}
            onSquareClick={() => handleClick(i)}
          />
        ))}
      </div>
    </>
  )
}

export default function Game() {
  const { history, setHistory, currentMove, setCurrentMove } = useGameStore()
  const xIsNext = currentMove % 2 === 0
  const currentSquares = history[currentMove]

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares]
    setHistory(nextHistory)
    setCurrentMove(nextHistory.length - 1)
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        fontFamily: 'monospace',
      }}
    >
      <div>
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div style={{ marginLeft: '1rem' }}>
        <ol>
          {history.map((_, historyIndex) => {
            const description =
              historyIndex > 0
                ? `Go to move #${historyIndex}`
                : 'Go to game start'

            return (
              <li key={historyIndex}>
                <button onClick={() => jumpTo(historyIndex)}>
                  {description}
                </button>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ]

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i]
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a]
    }
  }

  return null
}

function calculateTurns(squares) {
  return squares.filter((square) => !square).length
}

function calculateStatus(winner, turns, player) {
  if (!winner && !turns) return 'Draw'
  if (winner) return `Winner ${winner}`
  return `Next player: ${player}`
}
```

### 构建Board组件


我们首先创建 `Square` 组件，它将成为 `Board` 组件的构建块。该组件将代表我们游戏中的每个方块。


`Square` 组件应采用 `value` 和 `onSquareClick` 作为 props。它应该返回一个 `<button>` 元素，样式看起来像一个正方形。该按钮显示 value 属性，该属性可以是`'X'`、`'O'`或 null，具体取决于游戏的状态。单击按钮时，它会触发作为 prop 传入的 `onSquareClick` 函数，从而允许游戏响应用户输入。

这是 Square 组件的代码：

```tsx
function Square({ value, onSquareClick }) {
  return (
    <button
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        backgroundColor: '#fff',
        border: '1px solid #999',
        outline: 0,
        borderRadius: 0,
        fontSize: '1rem',
        fontWeight: 'bold',
      }}
      onClick={onSquareClick}
    >
      {value}
    </button>
  )
}
```

让我们继续创建 Board 组件，它将由排列在网格中的 9 个正方形组成。该组件将作为我们游戏的主要游戏区域。


 `Board` 组件应返回一个样式为网格的`<div>`元素。网格布局是使用 CSS Grid 实现的，具有三列和三行，每行占用相同比例的可用空间。网格的整体尺寸由宽度和高度属性决定，确保其为正方形且尺寸适当。


在网格内，我们放置了九个 Square 组件，每个组件都有一个代表其位置的 value prop。这些 Square 组件最终将保存游戏符号（`'X'`或`'O'`）并处理用户交互。

这是 Board 组件的代码：

```tsx
export default function Board() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
        width: 'calc(3 * 2.5rem)',
        height: 'calc(3 * 2.5rem)',
        border: '1px solid #999',
      }}
    >
      <Square value="1" />
      <Square value="2" />
      <Square value="3" />
      <Square value="4" />
      <Square value="5" />
      <Square value="6" />
      <Square value="7" />
      <Square value="8" />
      <Square value="9" />
    </div>
  )
}
```

该 Board 组件通过在 3x3 网格中排列九个方块来设置游戏板的基本结构。它将方块整齐地定位，为将来添加更多功能和处理玩家交互奠定了基础。

### 提升状态​


每个 `Square` 组件都可以维护游戏状态的一部分。为了检查 tic-tac-toe 游戏中的获胜者，`Board`组件需要以某种方式了解 9 个 `Board` 组件中每个组件的状态。


你会如何处理这个问题？首先，您可能会猜测 `Board` 组件需要向每个 `Square` 组件询问该 `Square` 的组件状态。尽管这种方法在 React 中在技术上是可行的，但我们不鼓励它，因为代码变得难以理解、容易出现错误并且难以重构。相反，最好的方法是将游戏的状态存储在父 `Board` 组件中，而不是每个 `Square` 组件中。 `Board` 组件可以通过传递 prop 来告诉每个 `Square` 组件要显示什么，就像您向每个 `Square` 组件传递数字时所做的那样。

:::tip
要从多个子组件收集数据，或者让两个或多个子组件相互通信，请在其父组件中声明共享状态。父组件可以通过 props 将该状态传递回子组件。这使得子组件之间以及与其父组件保持同步。
:::

我们趁这个机会来尝试一下吧。编辑 `Board` 组件，使其声明一个名为 squares 的状态变量，该变量默认为与 9 个方块相对应的 9 个空值数组：

```tsx
import { create } from 'zustand'
import { combine } from 'zustand/middleware'

const useGameStore = create(
  combine({ squares: Array(9).fill(null) }, (set) => {
    return {
      setSquares: (nextSquares) => {
        set((state) => ({
          squares:
            typeof nextSquares === 'function'
              ? nextSquares(state.squares)
              : nextSquares,
        }))
      },
    }
  }),
)

export default function Board() {
  const [squares, setSquares] = useGameStore((state) => [
    state.squares,
    state.setSquares,
  ])

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
        width: 'calc(3 * 2.5rem)',
        height: 'calc(3 * 2.5rem)',
        border: '1px solid #999',
      }}
    >
      {squares.map((square, squareIndex) => (
        <Square key={squareIndex} value={square} />
      ))}
    </div>
  )
}
```


`Array(9).fill(null)` 创建一个包含九个元素的数组，并将每个元素设置为 `null` `useGameStore` 声明了一个最初设置为该数组的`squares`状态。数组中的每个条目对应于一个平方的值。当您稍后填充棋盘时，方块数组将如下所示：


```ts
const squares = ['O', null, 'X', 'X', 'X', 'O', 'O', null, null]
```


现在，每个方块都会收到一个 `value` prop，对于空方块，该值可以是`'X'`、`'O'`或 `null`


接下来，您需要更改单击 `Square`  组件时发生的情况。 `Board` 组件现在维护哪些方格被填充。您需要为 `Square`  组件创建一种方法来更新 `Board` 的组件状态。由于状态对于定义它的组件来说是私有的，因此您无法直接从 `Square`  组件更新 `Board` 的组件状态。


相反，您将一个函数从 Board 组件传递到 `Square` 组件，并且当单击一个正方形时，您将让 `Square`  组件调用该函数。您将从 `Square`  组件在单击时调用的函数开始。您将调用该函数 `onSquareClick`


现在，您将 `onSquareClick` 属性连接到  `Board` 组件中的一个函数（您将其命名为`handleClick`）。要将 `onSquareClick` 连接到 `handleClick`，您需要将内联函数传递给第一个 Square 组件的 `onSquareClick` 属性：

```tsx
<Square key={squareIndex} value={square} onSquareClick={() => handleClick(i)} />
```


最后，您将在 `Board` 组件内定义 `handleClick` 函数，以更新保存板状态的方块数组。


`handleClick` 函数应获取要更新的方块的索引并创建`squares`数组 (`nextSquares`) `handleClick` 通过将 `X` 添加到指定索引 (`i`) 处的正方形（如果尚未填充）来更新 `nextSquares` 数组。

```tsx {7-12,29}
export default function Board() {
  const [squares, setSquares] = useGameStore((state) => [
    state.squares,
    state.setSquares,
  ])

  function handleClick(i) {
    if (squares[i]) return
    const nextSquares = squares.slice()
    nextSquares[i] = 'X'
    setSquares(nextSquares)
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
        width: 'calc(3 * 2.5rem)',
        height: 'calc(3 * 2.5rem)',
        border: '1px solid #999',
      }}
    >
      {squares.map((square, squareIndex) => (
        <Square
          key={squareIndex}
          value={square}
          onSquareClick={() => handleClick(squareIndex)}
        />
      ))}
    </div>
  )
}
```

:::tip
 请注意，在 `handleClick` 函数中，您如何调用 `.slice()` 来创建 squares 数组的副本，而不是修改现有数组。
:::


### 轮流​


现在是时候修复这款井字棋游戏中的一个主要缺陷了：`'O'`不能在棋盘上使用。


默认情况下，您将第一步设置为 `'X'` 。让我们通过向 `useGameStore` 挂钩添加另一段状态来跟踪这一点：

```tsx {2,12-18}
const useGameStore = create(
  combine({ squares: Array(9).fill(null), xIsNext: true }, (set) => {
    return {
      setSquares: (nextSquares) => {
        set((state) => ({
          squares:
            typeof nextSquares === 'function'
              ? nextSquares(state.squares)
              : nextSquares,
        }))
      },
      setXIsNext: (nextXIsNext) => {
        set((state) => ({
          xIsNext:
            typeof nextXIsNext === 'function'
              ? nextXIsNext(state.xIsNext)
              : nextXIsNext,
        }))
      },
    }
  }),
)
```


每次玩家移动时，`xIsNext`（布尔值）都会被翻转以确定下一个玩家，并且游戏的状态将被保存。您将更新 Board 的 `handleClick` 函数以翻转 `xIsNext` 的值：

```tsx {2-5,10,15}
export default function Board() {
  const [xIsNext, setXIsNext] = useGameStore((state) => [
    state.xIsNext,
    state.setXIsNext,
  ])
  const [squares, setSquares] = useGameStore((state) => [
    state.squares,
    state.setSquares,
  ])
  const player = xIsNext ? 'X' : 'O'

  function handleClick(i) {
    if (squares[i]) return
    const nextSquares = squares.slice()
    nextSquares[i] = player
    setSquares(nextSquares)
    setXIsNext(!xIsNext)
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
        width: 'calc(3 * 2.5rem)',
        height: 'calc(3 * 2.5rem)',
        border: '1px solid #999',
      }}
    >
      {squares.map((square, squareIndex) => (
        <Square
          key={squareIndex}
          value={square}
          onSquareClick={() => handleClick(squareIndex)}
        />
      ))}
    </div>
  )
}
```

### 宣布获胜者或平局​


现在玩家可以轮流进行，您需要显示游戏何时获胜或平局，并且不再需要进行轮流。为此，您将添加三个辅助函数。第一个辅助函数名为`calculateWinner`，它采用 9 个方格的数组，检查获胜者并根据需要返回`'X'`、`'O'`或 `null`。第二个辅助函数名为`calculateTurns`，它采用相同的数组，通过仅过滤掉 `null`项目来检查剩余的回合，并返回它们的计数。最后一个助手名为`calculateStatus`，它负责剩余回合、获胜者和当前玩家（`'X'`或`'O'`）：


```ts
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ]

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i]
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a]
    }
  }

  return null
}

function calculateTurns(squares) {
  return squares.filter((square) => !square).length
}

function calculateStatus(winner, turns, player) {
  if (!winner && !turns) return 'Draw'
  if (winner) return `Winner ${winner}`
  return `Next player: ${player}`
}
```

您将在 Board 组件的`handleClick` 函数中使用 `calculateWinner(squares)` 的结果来检查玩家是否获胜。您可以在检查用户是否单击了已有`'X'`或`'O'`的方块的同时执行此检查。在这两种情况下我们都希望早点返回：

```ts {2}
function handleClick(i) {
  if (squares[i] || winner) return
  const nextSquares = squares.slice()
  nextSquares[i] = player'
  setSquares(nextSquares)
  setXIsNext(!xIsNext)
}
```


为了让玩家知道游戏何时结束，您可以显示`'Winner: X'`或`'Winner: O'`等文本。为此，您需要向 `Board` 组件添加一个`status` 态部分。如果游戏结束，状态将显示获胜者或平局；如果游戏正在进行，您将显示下一个轮到哪个玩家：

```tsx {10-11,13,25}
export default function Board() {
  const [xIsNext, setXIsNext] = useGameStore((state) => [
    state.xIsNext,
    state.setXIsNext,
  ])
  const [squares, setSquares] = useGameStore((state) => [
    state.squares,
    state.setSquares,
  ])
  const winner = calculateWinner(squares)
  const turns = calculateTurns(squares)
  const player = xIsNext ? 'X' : 'O'
  const status = calculateStatus(winner, turns, player)

  function handleClick(i) {
    if (squares[i] || winner) return
    const nextSquares = squares.slice()
    nextSquares[i] = player
    setSquares(nextSquares)
    setXIsNext(!xIsNext)
  }

  return (
    <>
      <div style={{ marginBottom: '0.5rem' }}>{status}</div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'repeat(3, 1fr)',
          width: 'calc(3 * 2.5rem)',
          height: 'calc(3 * 2.5rem)',
          border: '1px solid #999',
        }}
      >
        {squares.map((square, squareIndex) => (
          <Square
            key={squareIndex}
            value={square}
            onSquareClick={() => handleClick(squareIndex)}
          />
        ))}
      </div>
    </>
  )
}
```

恭喜！您现在已经有了一个可以运行的井字游戏。您也刚刚学习了 React 和 Zustand 的基础知识。所以你是这里真正的赢家。代码应如下所示：

```tsx
import { create } from 'zustand'
import { combine } from 'zustand/middleware'

const useGameStore = create(
  combine({ squares: Array(9).fill(null), xIsNext: true }, (set) => {
    return {
      setSquares: (nextSquares) => {
        set((state) => ({
          squares:
            typeof nextSquares === 'function'
              ? nextSquares(state.squares)
              : nextSquares,
        }))
      },
      setXIsNext: (nextXIsNext) => {
        set((state) => ({
          xIsNext:
            typeof nextXIsNext === 'function'
              ? nextXIsNext(state.xIsNext)
              : nextXIsNext,
        }))
      },
    }
  }),
)

function Square({ value, onSquareClick }) {
  return (
    <button
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        backgroundColor: '#fff',
        border: '1px solid #999',
        outline: 0,
        borderRadius: 0,
        fontSize: '1rem',
        fontWeight: 'bold',
      }}
      onClick={onSquareClick}
    >
      {value}
    </button>
  )
}

export default function Board() {
  const [xIsNext, setXIsNext] = useGameStore((state) => [
    state.xIsNext,
    state.setXIsNext,
  ])
  const [squares, setSquares] = useGameStore((state) => [
    state.squares,
    state.setSquares,
  ])
  const winner = calculateWinner(squares)
  const turns = calculateTurns(squares)
  const player = xIsNext ? 'X' : 'O'
  const status = calculateStatus(winner, turns, player)

  function handleClick(i) {
    if (squares[i] || winner) return
    const nextSquares = squares.slice()
    nextSquares[i] = player
    setSquares(nextSquares)
    setXIsNext(!xIsNext)
  }

  return (
    <>
      <div style={{ marginBottom: '0.5rem' }}>{status}</div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'repeat(3, 1fr)',
          width: 'calc(3 * 2.5rem)',
          height: 'calc(3 * 2.5rem)',
          border: '1px solid #999',
        }}
      >
        {squares.map((square, squareIndex) => (
          <Square
            key={squareIndex}
            value={square}
            onSquareClick={() => handleClick(squareIndex)}
          />
        ))}
      </div>
    </>
  )
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ]

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i]
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a]
    }
  }

  return null
}

function calculateTurns(squares) {
  return squares.filter((square) => !square).length
}

function calculateStatus(winner, turns, player) {
  if (!winner && !turns) return 'Draw'
  if (winner) return `Winner ${winner}`
  return `Next player: ${player}`
}
```

### 添加时间旅行​

作为最后的练习，让我们能够“回到过去”并重新审视游戏中之前的动作。


如果直接修改 squares 数组，实现这个时间旅行功能会非常困难。但是，由于您在每次移动后使用 `slice()` 创建 squares 数组的新副本，并将其视为不可变，因此您可以存储 Squares 数组的每个过去版本并在它们之间导航。

You'll keep track of these past squares arrays in a new state variable called `history`. This
`history` array will store all board states, from the first move to the latest one, and will look
something like this:

您将在称为`history`的新状态变量中跟踪这些过去的平方数组。这`history`数组将存储所有棋盘状态，从第一次移动到最新一次，并且看起来像这样：

```ts
const history = [
  // First move
  [null, null, null, null, null, null, null, null, null],
  // Second move
  ['X', null, null, null, null, null, null, null, null],
  // Third move
  ['X', 'O', null, null, null, null, null, null, null],
  // and so on...
]
```

这种方法可以让您轻松地在不同的游戏状态之间导航并实现时间旅行功能。

### 再次提升状态​

Next, you will create a new top-level component called `Game` to display a list of past moves. This
is where you will store the `history` state that contains the entire game history.

接下来，您将创建一个名为 `Game` 的新顶级组件来显示过去的动作列表。您将在此处存储包含整个游戏历史记录的`history`状态。

By placing the `history` state in the `Game` component, you can remove the `squares` state from the
`Board` component. You will now lift the state up from the `Board` component to the top-level `Game`
component. This change allows the `Game` component to have full control over the `Board`'s
component data and instruct the `Board` component to render previous turns from the `history`.

通过将`history`状态放置在 `Game`  组件中，您可以从 `Board` 组件中删除 `squares`状态。现在，您将把状态从  `Board` 组件提升到顶级 `Game` 组件。此更改允许 `Game` 组件完全控制 `Board` 的组件数据，并指示 `Board` 组件渲染`history`记录中的先前回合。

First, add a `Game` component with `export default` and remove it from `Board` component. Here is
what the code should look like:

首先，添加一个具有 `export default`值的  `Game` 组件，并将其从 `Board` 组件中删除。代码应如下所示：

```tsx {1,48-65}
function Board() {
  const [xIsNext, setXIsNext] = useGameStore((state) => [
    state.xIsNext,
    state.setXIsNext,
  ])
  const [squares, setSquares] = useGameStore((state) => [
    state.squares,
    state.setSquares,
  ])
  const winner = calculateWinner(squares)
  const turns = calculateTurns(squares)
  const player = xIsNext ? 'X' : 'O'
  const status = calculateStatus(winner, turns, player)

  function handleClick(i) {
    if (squares[i] || winner) return
    const nextSquares = squares.slice()
    nextSquares[i] = player
    setSquares(nextSquares)
    setXIsNext(!xIsNext)
  }

  return (
    <>
      <div style={{ marginBottom: '0.5rem' }}>{status}</div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'repeat(3, 1fr)',
          width: 'calc(3 * 2.5rem)',
          height: 'calc(3 * 2.5rem)',
          border: '1px solid #999',
        }}
      >
        {squares.map((square, squareIndex) => (
          <Square
            key={squareIndex}
            value={square}
            onSquareClick={() => handleClick(squareIndex)}
          />
        ))}
      </div>
    </>
  )
}

export default function Game() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        fontFamily: 'monospace',
      }}
    >
      <div>
        <Board />
      </div>
      <div style={{ marginLeft: '1rem' }}>
        <ol>{/*TODO*/}</ol>
      </div>
    </div>
  )
}
```


向 `useGameStore` 挂钩添加一些状态来跟踪移动历史记录：

```ts {2,4-11}
const useGameStore = create(
  combine({ history: [Array(9).fill(null)], xIsNext: true }, (set) => {
    return {
      setHistory: (nextHistory) => {
        set((state) => ({
          history:
            typeof nextHistory === 'function'
              ? nextHistory(state.history)
              : nextHistory,
        }))
      },
      setXIsNext: (nextXIsNext) => {
        set((state) => ({
          xIsNext:
            typeof nextXIsNext === 'function'
              ? nextXIsNext(state.xIsNext)
              : nextXIsNext,
        }))
      },
    }
  }),
)
```


请注意 `[Array(9).fill(null)]` 如何创建一个包含单个项目的数组，该数组本身就是一个包含 9 个空值的数组。


要渲染当前移动的方块，您需要从`history` 状态中读取最新的方块数组。您不需要为此额外的状态，因为您已经有足够的信息来在渲染期间计算它：

```tsx {2-3}
export default function Game() {
  const { history, setHistory, xIsNext, setXIsNext } = useGameStore()
  const currentSquares = history[history.length - 1]

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        fontFamily: 'monospace',
      }}
    >
      <div>
        <Board />
      </div>
      <div style={{ marginLeft: '1rem' }}>
        <ol>{/*TODO*/}</ol>
      </div>
    </div>
  )
}
```


接下来，在 `Game`  组件内创建一个 `handlePlay`  `Board` 组件将调用该函数来更新游戏。将 `xIsNext``currentSquares` 和 `handlePlay` 作为 props 传递给 `Board` 组件：

```tsx {5-7,18}
export default function Game() {
  const { history, setHistory, xIsNext, setXIsNext } = useGameStore()
  const currentSquares = history[history.length - 1]

  function handlePlay(nextSquares) {
    // TODO
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        fontFamily: 'monospace',
      }}
    >
      <div>
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div style={{ marginLeft: '1rem' }}>
        <ol>{/*TODO*/}</ol>
      </div>
    </div>
  )
}
```

Let's make the `Board` component fully controlled by the props it receives. To do this, we'll modify
the `Board` component to accept three props: `xIsNext`, `squares`, and a new `onPlay` function that
the `Board` component can call with the updated squares array when a player makes a move.


让我们让 `Board`  组件完全由它收到的 props 控制。为此，我们将修改 `Board` 组件以接受三个属性：`xIsNext`、`squares` 和一个新的 `onPlay` 函数，当玩家移动时，`Board` 组件可以使用更新的 squares 数组调用该函数。

```tsx {1}
function Board({ xIsNext, squares, onPlay }) {
  const winner = calculateWinner(squares)
  const turns = calculateTurns(squares)
  const player = xIsNext ? 'X' : 'O'
  const status = calculateStatus(winner, turns, player)

  function handleClick(i) {
    if (squares[i] || winner) return
    const nextSquares = squares.slice()
    nextSquares[i] = player
    setSquares(nextSquares)
  }

  return (
    <>
      <div style={{ marginBottom: '0.5rem' }}>{status}</div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'repeat(3, 1fr)',
          width: 'calc(3 * 2.5rem)',
          height: 'calc(3 * 2.5rem)',
          border: '1px solid #999',
        }}
      >
        {squares.map((square, squareIndex) => (
          <Square
            key={squareIndex}
            value={square}
            onSquareClick={() => handleClick(squareIndex)}
          />
        ))}
      </div>
    </>
  )
}
```


`Board` 组件现在完全由 `Game` 组件传递给它的 props 控制。为了让游戏再次运行，您需要在 `Game` 组件中实现`handlePlay` 函数。


调用时`handlePlay``应该做什么？以前，Board` 组件称为 `setSquares，具有更新的数组；现在它将更新后的` squares 数组传递给 `onPlay。`


`handlePlay` 函数需要更新 `Game` 组件的状态以触发重新渲染。您将通过将更新的 squares 数组附加为新的`history`记录条目来更新历史状态变量，而不是使用 `setSquares`。您还需要切换 `xIsNext`，就像 `Board` 组件过去所做的那样。

```ts {2-3}
function handlePlay(nextSquares) {
  setHistory(history.concat([nextSquares]))
  setXIsNext(!xIsNext)
}
```


此时，您已将状态移至 `Game` 组件中，并且 UI 应该完全正常工作，就像重构之前一样。此时代码应如下所示：

```tsx
import { create } from 'zustand'
import { combine } from 'zustand/middleware'

const useGameStore = create(
  combine({ history: [Array(9).fill(null)], xIsNext: true }, (set) => {
    return {
      setHistory: (nextHistory) => {
        set((state) => ({
          history:
            typeof nextHistory === 'function'
              ? nextHistory(state.history)
              : nextHistory,
        }))
      },
      setXIsNext: (nextXIsNext) => {
        set((state) => ({
          xIsNext:
            typeof nextXIsNext === 'function'
              ? nextXIsNext(state.xIsNext)
              : nextXIsNext,
        }))
      },
    }
  }),
)

function Square({ value, onSquareClick }) {
  return (
    <button
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        backgroundColor: '#fff',
        border: '1px solid #999',
        outline: 0,
        borderRadius: 0,
        fontSize: '1rem',
        fontWeight: 'bold',
      }}
      onClick={onSquareClick}
    >
      {value}
    </button>
  )
}

function Board({ xIsNext, squares, onPlay }) {
  const winner = calculateWinner(squares)
  const turns = calculateTurns(squares)
  const player = xIsNext ? 'X' : 'O'
  const status = calculateStatus(winner, turns, player)

  function handleClick(i) {
    if (squares[i] || winner) return
    const nextSquares = squares.slice()
    nextSquares[i] = player
    onPlay(nextSquares)
  }

  return (
    <>
      <div style={{ marginBottom: '0.5rem' }}>{status}</div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'repeat(3, 1fr)',
          width: 'calc(3 * 2.5rem)',
          height: 'calc(3 * 2.5rem)',
          border: '1px solid #999',
        }}
      >
        {squares.map((square, squareIndex) => (
          <Square
            key={squareIndex}
            value={square}
            onSquareClick={() => handleClick(squareIndex)}
          />
        ))}
      </div>
    </>
  )
}

export default function Game() {
  const { history, setHistory, xIsNext, setXIsNext } = useGameStore()
  const currentSquares = history[history.length - 1]

  function handlePlay(nextSquares) {
    setHistory(history.concat([nextSquares]))
    setXIsNext(!xIsNext)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        fontFamily: 'monospace',
      }}
    >
      <div>
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div style={{ marginLeft: '1rem' }}>
        <ol>{/*TODO*/}</ol>
      </div>
    </div>
  )
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ]

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i]
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a]
    }
  }

  return null
}

function calculateTurns(squares) {
  return squares.filter((square) => !square).length
}

function calculateStatus(winner, turns, player) {
  if (!winner && !turns) return 'Draw'
  if (winner) return `Winner ${winner}`
  return `Next player: ${player}`
}
```

### 显示过去的动作

由于您正在记录井字棋游戏的历史记录，因此您现在可以向玩家显示过去的动作列表。


您已经存储了一系列`history`动作，因此现在需要将其转换为 React 元素数组。在 JavaScript 中，要将一个数组转换为另一个数组，可以使用 Array `.map() `方法：


您将使用 `map` 将您的移动`history`记录转换为代表屏幕上按钮的 React 元素，并显示按钮列表以**跳转**到过去的移动。让我们回顾一下 `Game` 组件中的`history`记录：

```tsx {26-41}
export default function Game() {
  const { history, setHistory, xIsNext, setXIsNext } = useGameStore()
  const currentSquares = history[history.length - 1]

  function handlePlay(nextSquares) {
    setHistory(history.concat([nextSquares]))
    setXIsNext(!xIsNext)
  }

  function jumpTo(nextMove) {
    // TODO
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        fontFamily: 'monospace',
      }}
    >
      <div>
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div style={{ marginLeft: '1rem' }}>
        <ol>
          {history.map((_, historyIndex) => {
            const description =
              historyIndex > 0
                ? `Go to move #${historyIndex}`
                : 'Go to game start'

            return (
              <li key={historyIndex}>
                <button onClick={() => jumpTo(historyIndex)}>
                  {description}
                </button>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
```


在实现 `JumpTo` 函数之前，您需要 `Game` 组件来跟踪用户当前正在查看的步骤。为此，定义一个名为 `currentMove` 的新状态变量，该变量将从 `0` 开始：

```ts {3,14-21}
const useGameStore = create(
  combine(
    { history: [Array(9).fill(null)], currentMove: 0, xIsNext: true },
    (set) => {
      return {
        setHistory: (nextHistory) => {
          set((state) => ({
            history:
              typeof nextHistory === 'function'
                ? nextHistory(state.history)
                : nextHistory,
          }))
        },
        setCurrentMove: (nextCurrentMove) => {
          set((state) => ({
            currentMove:
              typeof nextCurrentMove === 'function'
                ? nextCurrentMove(state.currentMove)
                : nextCurrentMove,
          }))
        },
        setXIsNext: (nextXIsNext) => {
          set((state) => ({
            xIsNext:
              typeof nextXIsNext === 'function'
                ? nextXIsNext(state.xIsNext)
                : nextXIsNext,
          }))
        },
      }
    },
  ),
)
```


接下来，更新 `Game` 组件内的 `JumpTo` 函数以更新 `currentMove`。如果您将 `currentMove` 更改为偶数，您还需要将 `xIsNext` 设置为 true。

```ts {2-3}
function jumpTo(nextMove) {
  setCurrentMove(nextMove)
  setXIsNext(currentMove % 2 === 0)
}
```

You will now make two changes to the `handlePlay` function in the `Game` component, which is called
when you click on a square.

- 如果您“回到过去”，然后从该点开始新的动作，您只想保留该点之前的历史记录。您无需在历史记录中的所有项目之后添加 `nextSquares`（使用 Array `.concat()` 方法），而是将其添加在`history.slice(0, currentMove + 1)` 中的所有项目之后，以仅保留旧历史记录的该部分。
- 每次进行移动时，您都需要更新 `currentMove` 以指向最新的历史记录条目。

```ts {2-4}
function handlePlay(nextSquares) {
  const nextHistory = history.slice(0, currentMove + 1).concat([nextSquares])
  setHistory(nextHistory)
  setCurrentMove(nextHistory.length - 1)
  setXIsNext(!xIsNext)
}
```

最后，您将修改 `Game` 组件以渲染当前选定的动作，而不是始终渲染最终的动作：

```tsx {2-10}
export default function Game() {
  const {
    history,
    setHistory,
    currentMove,
    setCurrentMove,
    xIsNext,
    setXIsNext,
  } = useGameStore()
  const currentSquares = history[currentMove]

  function handlePlay(nextSquares) {
    const nextHistory = history.slice(0, currentMove + 1).concat([nextSquares])
    setHistory(nextHistory)
    setCurrentMove(nextHistory.length - 1)
    setXIsNext(!xIsNext)
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove)
    setXIsNext(currentMove % 2 === 0)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        fontFamily: 'monospace',
      }}
    >
      <div>
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div style={{ marginLeft: '1rem' }}>
        <ol>
          {history.map((_, historyIndex) => {
            const description =
              historyIndex > 0
                ? `Go to move #${historyIndex}`
                : 'Go to game start'

            return (
              <li key={historyIndex}>
                <button onClick={() => jumpTo(historyIndex)}>
                  {description}
                </button>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
```

### 最后清理


如果仔细观察代码，您会发现当 `currentMove` 为偶数时 `xIsNext` 为 `true`，当 `currentMove` 为奇数时 `xIsNext` 为 `false`。这意味着如果您知道 `currentMove` 的值，您始终可以确定 `xIsNext` 应该是什么。


无需在状态中单独存储 `xIsNext`。最好避免冗余状态，因为它可以减少错误并使代码更易于理解。相反，您可以根据 `currentMove` 计算 `xIsNext`：

```tsx {2,10,14}
export default function Game() {
  const { history, setHistory, currentMove, setCurrentMove } = useGameStore()
  const xIsNext = currentMove % 2 === 0
  const currentSquares = history[currentMove]

  function handlePlay(nextSquares) {
    const nextHistory = history.slice(0, currentMove + 1).concat([nextSquares])
    setHistory(nextHistory)
    setCurrentMove(nextHistory.length - 1)
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        fontFamily: 'monospace',
      }}
    >
      <div>
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div style={{ marginLeft: '1rem' }}>
        <ol>
          {history.map((_, historyIndex) => {
            const description =
              historyIndex > 0
                ? `Go to move #${historyIndex}`
                : 'Go to game start'

            return (
              <li key={historyIndex}>
                <button onClick={() => jumpTo(historyIndex)}>
                  {description}
                </button>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
```


您不再需要 `xIsNext` 状态声明或对 `setXIsNext` 的调用。现在，即使您在编写组件时犯了错误，`xIsNext` 也不会与 `currentMove` 不同步。

### 总结​

恭喜！您已经创建了一个井字游戏：

- 让你玩井字游戏，
- 指示玩家何时赢得比赛或何时平局，
- 随着游戏的进展存储游戏的历史记录，
- 允许玩家回顾游戏历史并查看游戏棋盘的先前版本。

干得好！我们希望您现在感觉自己已经很好地掌握了 React 和 Zustand 的工作原理。
