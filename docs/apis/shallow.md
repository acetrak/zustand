---
title: shallow
description: 如何有效比较简单数据
nav: 27
---

`shallow`可让您对简单的数据结构进行快速检查。当您使用其中没有嵌套对象或数组的数据结构时，它可以有效地识别顶级属性的更改。

:::tip
浅层可让您执行快速比较，但请记住其局限性。
:::

```js
const equal = shallow(a, b)
```

## 类型

### 签名

```ts
shallow<T>(a: T, b: T): boolean
```

## 语法

### `shallow(a, b)`

#### 参数

- `a`: 第一个值.
- `b`: 第二个值.

#### 返回

当 `a` 和 `b` 基于其**顶级**属性的浅比较相等时，`shallow` 返回 `true`。否则，它应该返回 `false`。

## 用法

### 比较原始值

当比较`string`、`number`、`boolean`和 `BigInt` 等原始值时，如果值相同，则 `Object.is` 和`shallow` 函数都返回 `true`。这是因为原始值是通过其实际值而不是通过引用进行比较的。

```ts
const stringLeft = 'John Doe'
const stringRight = 'John Doe'

Object.is(stringLeft, stringRight) // -> true
shallow(stringLeft, stringRight) // -> true

const numberLeft = 10
const numberRight = 10

Object.is(numberLeft, numberRight) // -> true
shallow(numberLeft, numberRight) // -> true

const booleanLeft = true
const booleanRight = true

Object.is(booleanLeft, booleanRight) // -> true
shallow(booleanLeft, booleanRight) // -> true

const bigIntLeft = 1n
const bigIntRight = 1n

Object.is(bigIntLeft, bigIntRight) // -> true
shallow(bigIntLeft, bigIntRight) // -> true
```

### 比较对象

比较对象时，了解 `Object.is` 和`shallow`函数的操作方式非常重要，因为它们处理比较的方式不同。

由于`shallow` 执行对象的浅比较，因此`shallow` 函数返回`true`。它检查顶级属性及其值是否相同。在本例中，`objectLeft` 和 `objectRight` 之间的顶级属性（`firstName`、`lastName` 和`age`）及其值是相同的，因此`shallow` 认为它们相等。

```ts
const objectLeft = {
  firstName: 'John',
  lastName: 'Doe',
  age: 30,
}
const objectRight = {
  firstName: 'John',
  lastName: 'Doe',
  age: 30,
}

Object.is(objectLeft, objectRight) // -> false
shallow(objectLeft, objectRight) // -> true
```

### 比较 Sets

比较集合时，了解 `Object.is` 和`shallow` 函数的操作方式非常重要，因为它们处理比较的方式不同。

由于`shallow` 执行集合的浅比较，因此`shallow` 函数返回`true`。它检查顶级属性（在本例中为集合本身）是否相同。由于 `setLeft` 和 `setRight` 都是 Set 对象的实例并且包含相同的元素，因此`shallow` 认为它们相等。

```ts
const setLeft = new Set([1, 2, 3])
const setRight = new Set([1, 2, 3])

Object.is(setLeft, setRight) // -> false
shallow(setLeft, setRight) // -> true
```

### 比较 Maps

比较映射时，了解 `Object.is` 和`shallow`函数的操作方式非常重要，因为它们处理比较的方式不同。

`shallow` 返回 `true`，因为浅层执行映射的浅层比较。它检查顶级属性（在本例中为映射本身）是否相同。由于`mapLeft`和`mapRight`都是`Map`对象的实例并且包含相同的键值对，因此shallow认为它们相等。

```ts
const mapLeft = new Map([
  [1, 'one'],
  [2, 'two'],
  [3, 'three'],
])
const mapRight = new Map([
  [1, 'one'],
  [2, 'two'],
  [3, 'three'],
])

Object.is(mapLeft, mapRight) // -> false
shallow(mapLeft, mapRight) // -> true
```

## 故障排除

### 即使对象相同，比较对象也会返回 false

`shallow`函数执行浅层比较。浅比较检查两个对象的顶级属性是否相等。它不检查嵌套对象或深层嵌套属性。换句话说，它仅比较属性的引用。

在以下示例中，shallow 函数返回 `false`，因为它仅比较顶级属性及其引用。两个对象中的地址属性都是嵌套对象，尽管它们的内容相同，但它们的引用不同。因此，浅薄的人认为它们是不同的，从而导致错误。

```ts
const objectLeft = {
  firstName: 'John',
  lastName: 'Doe',
  age: 30,
  address: {
    street: 'Kulas Light',
    suite: 'Apt. 556',
    city: 'Gwenborough',
    zipcode: '92998-3874',
    geo: {
      lat: '-37.3159',
      lng: '81.1496',
    },
  },
}
const objectRight = {
  firstName: 'John',
  lastName: 'Doe',
  age: 30,
  address: {
    street: 'Kulas Light',
    suite: 'Apt. 556',
    city: 'Gwenborough',
    zipcode: '92998-3874',
    geo: {
      lat: '-37.3159',
      lng: '81.1496',
    },
  },
}

Object.is(objectLeft, objectRight) // -> false
shallow(objectLeft, objectRight) // -> false
```

如果我们删除`address` 属性，浅层比较将按预期工作，因为所有顶级属性都将是原始值或对相同值的引用：

```ts
const objectLeft = {
  firstName: 'John',
  lastName: 'Doe',
  age: 30,
}
const objectRight = {
  firstName: 'John',
  lastName: 'Doe',
  age: 30,
}

Object.is(objectLeft, objectRight) // -> false
shallow(objectLeft, objectRight) // -> true
```

在此修改后的示例中，`objectLeft` 和 `objectRight` 具有相同的顶级属性和原始值。由于浅函数仅比较顶级属性，因此它将返回 `true`，因为两个对象中的原始值（`firstName`、`lastName` 和`age`）是相同的。
