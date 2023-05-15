# jsx
createElement 把上面写的 jsx，变成 react element 对象; 而 cloneElement 的作用是以 element 元素为样板克隆并返回新的 React element 元素

# component
在 class 组件中，除了继承 React.Component ，底层还加入了 updater 对象，组件中调用的 setState 和 forceUpdate 本质上是调用了 updater 对象上的 enqueueSetState 和 enqueueForceUpdate 方法。
## 类
```js
react/src/ReactBaseClasses.js

function Component(props, context, updater) {
  this.props = props;      //绑定props
  this.context = context;  //绑定context
  this.refs = emptyObject; //绑定ref
  this.updater = updater || ReactNoopUpdateQueue; //上面所属的updater 对象
}
/* 绑定setState 方法 */
Component.prototype.setState = function(partialState, callback) {
  this.updater.enqueueSetState(this, partialState, callback, 'setState');
}
/* 绑定forceupdate 方法 */
Component.prototype.forceUpdate = function(callback) {
  this.updater.enqueueForceUpdate(this, callback, 'forceUpdate');
}
```

## 组件通信方式
- props 
- ref
- redux mobx
- context 上下文
- event bus 事件总线 :更适合做基建 taro<br>
弊端:违背单项数据流 需要手动绑定和解绑 难以维护

# state

## setState流程
- 产生当前更新的优先级（expirationTime  lane）
- React从fiber root根部向下调和子节点，调和阶段对比发生更新的地方，更新对比expirationTime，找到更新的组件，合并state，触发render函数，完成render阶段
- 到commit阶段 ，替换真实DOM，完成此次更新流程
- 此时仍在commit阶段，执行setState的callback函数，到此完成一次setState全过程

主要的先后顺序：render 阶段 render 函数执行 -> commit 阶段真实 DOM 替换 -> setState 回调函数执行 callback

## 类组件限制state更新
每次setState,不管你设置的值也没有更新，都会执行render函数进行更新，如何限制更新呢：
- purComponent 会对prop和state做浅比较，没变化不更新
- shouldComponentUpdate 返回true就更新

## setState原理
对于类组件，类组件初始化过程中绑定了负责更新的Updater对象，对于如果调用 setState 方法，实际上是 React 底层调用 Updater 对象上的 enqueueSetState 方法。

enqueueSetState 作用实际很简单，就是创建一个 update ，然后放入当前 fiber 对象的待更新队列中，最后开启调度更新，进入上述讲到的更新流程。

内部维护一个标识进行批量更新。
```js
handleClick= () => {
        this.setState({ number:this.state.number + 1 },()=>{   console.log( 'callback1', this.state.number)  })
        console.log(this.state.number)
        this.setState({ number:this.state.number + 1 },()=>{   console.log( 'callback2', this.state.number)  })
        console.log(this.state.number)
        this.setState({ number:this.state.number + 1 },()=>{   console.log( 'callback3', this.state.number)  })
        console.log(this.state.number)
}
// 0, 0, 0, callback1 1 ,callback2 1 ,callback3 1  批量更新
```
如果把事件包在定时器中，则输出`callback1 1 , 1, callback2 2 , 2,callback3 3 , 3`

## flushSync
> lushSync 在同步条件下，会合并之前的 setState | useState，可以理解成，如果发现了 flushSync ，就会先执行更新，如果之前有未更新的 setState ｜ useState ，就会一起合并了

## setSate vs useState
相同点：底层都调用了 scheduleUpdateOnFiber,都有批量更新规则
- setSate是和老state进行合并处理 useState是重新赋值
- 有监听变化的callback useEffect监听
- 在不是pureComponent，只要调用setState就会触发更新。useState的dispatchAction会默认比较两次state是否相同然后决定是否更新。

# lifecycle
## 初始化
`constructor -> getDerivedStateFromProps / componentWillMount -> render -> componentDidMount`
## 更新
`componentWillReceiveProps( props 改变) / getDerivedStateFromProp -> shouldComponentUpdate -> componentWillUpdate -> render -> getSnapshotBeforeUpdate -> componentDidUpdate`
## useEffect 和 useLayoutEffect 
修改 DOM ，改变布局就用 useLayoutEffect ，其他情况就用 useEffect 
## componentDidUpdate
```js
useEffect(()=>{})
useEffect 是异步执行，默认初始化执行一次
componentDidUpdate 是同步执行  组件更新后执行

```
## componentDidMount
```js
useEffect(()=>{},[])
第二个参数不传，函数每次执行。传[]初始化执行一次
```
## componentWillUnMount
```js
 React.useEffect(()=>{
        /* 请求数据 ， 事件监听 ， 操纵dom ， 增加定时器，延时器 */
        return function componentWillUnmount(){
            /* 解除事件监听器 ，清除定时器，延时器 */
        }
},[])
``` 

# ref
## 类ref
```js
class Index extends React.Component{
    constructor(props){
       super(props)
       this.currentDom = React.createRef(null)
    }
    componentDidMount(){
        console.log(this.currentDom)// .current 为dom
    }
    render= () => <div ref={ this.currentDom } >ref对象模式获取元素或组件</div>
}
```
## 函数ref
```js
export default function Index(){
    const currentDom = React.useRef(null)
    React.useEffect(()=>{
        console.log( currentDom.current ) // div
    },[])
    return  <div ref={ currentDom } >ref对象模式获取元素或组件</div>
}
```

# context
```js
const ThemeContext = React.createContext(null) //
const ThemeProvider = ThemeContext.Provider  //提供者
const ThemeConsumer = ThemeContext.Consumer // 订阅消费者
```
## 提供者
```js
const ThemeProvider = ThemeContext.Provider  //提供者
export default function ProviderDemo(){
    const [ contextValue , setContextValue ] = React.useState({  color:'#ccc', background:'pink' })
    return <div>
        <ThemeProvider value={ contextValue } > 
            <Son />
        </ThemeProvider>
    </div>
}
```

## 消费
### useContext
```js
const ThemeContext = React.createContext(null)
// 函数组件 - useContext方式
function ConsumerDemo(){
    const  contextValue = React.useContext(ThemeContext) /*  */
    const { color,background } = contextValue
    return <div style={{ color,background } } >消费者</div> 
}
const Son = ()=> <ConsumerDemo />
```
### ThemeContext.Consumer
```js
const ThemeConsumer = ThemeContext.Consumer // 订阅消费者
function ConsumerDemo(props){
    const { color,background } = props
    return <div style={{ color,background } } >消费者</div> 
}
const Son = () => (
    <ThemeConsumer>
       { /* 将 context 内容转化成 props  */ }
       { (contextValue)=> <ConsumerDemo  {...contextValue}  /> }
    </ThemeConsumer>
) 
```

## 调度
vue组件粒度更新，能够快速响应。react从根节点开始diff,找出不同更新。在一次更新调度过程中，workLoop 会更新执行每一个待更新的 fiber 。他们的区别就是异步模式会调用一个 shouldYield() ，如果当前浏览器没有空余时间， shouldYield 会中止循环，直到浏览器有空闲时间后再继续遍历，从而达到终止渲染的目的。这样就解决了一次性遍历大量的 fiber ，导致浏览器没有时间执行一些渲染任务，导致了页面卡顿。

### 时间分片
1. 递归执行setTimeout,会有4ms时间差
2. MessageChannel

- taskQueue 存放的是过期任务，根据任务的过期时间expirationTime排序，在workLoop中循环完成这些任务
- timeQueue 存放的是没有过期任务，根据任务的开始时间排序，在调度workLoop中会用advanceTimers检查任务是否过期，过期就放入taskQueue队列

scheduleCallback 流程如下。

- 创建一个新的任务 newTask。
- 通过任务的开始时间( startTime ) 和 当前时间( currentTime ) 比较:当 startTime > currentTime, 说明未过期, 存到 timerQueue，当 startTime <= currentTime, 说明已过期, 存到 taskQueue。
- 如果任务过期，并且没有调度中的任务，那么调度 requestHostCallback。本质上调度的是 flushWork。
- 如果任务没有过期，用 requestHostTimeout 延时执行 handleTimeout。


## fiber
fiber诞生React16版本，fiber架构就是解决大型应用卡顿。可以理解fiber就是react 的虚拟dom。

react15以及之前递归遍历更新，一旦开始无法中断。

更新fiber的过程叫做 `Reconciler(调和器)`，每一个fiber都可以作为一个执行单元来处理。每个fiber根据自身的过期时间来判断是否还有时间更新，没有就把主动权交给浏览器。等浏览器空闲通过
`scheduler（调度器）`再次恢复执行单元来


### fiber更新机制

#### 初始化
1. fiberRoot 首次构建应用，创建一个fr,作为整个react应用的根基
2. rootFiber 一个组件一个rf
3. workInProgress current
  
#### render commit
- render阶段<br>
<strong>
核心思想就是diff对比，react首先对比childLanes来找到更新的组件。找到对应的组件后，执行组件的render函数，得到新的element对象，接下来就是新element和老fiber的diff，复用老fiber，创建新fiber。render阶段不会实质性执行更新，只会给fiber打上不同flag标准，证明当前fiber发生什么变化</strong>



```js
function workLoop (){
    while (workInProgress !== null ) {
      workInProgress = performUnitOfWork(workInProgress);
    }
}
```
每一个fiber看作一个执行单元，在调和过程中，每一个发生更新的fiber都会昨晚一次workInProgress。work Loop就是执行每一个单元的调度器。如果渲染没有被中断，那么workLoop会遍历一遍fiber树。performUnitOfWork 包括两个阶段 beginWork 和 completeWork
beginWork:<br>
1. beginWork：是向下调和的过程。对应组件执行部分生命周期，执行render,得到最新的children.
向下遍历调和children,复用oldFiber（diff）
2. completeUnitOfWork 向上归并的过程
completeWork:<br>

#### diff
```html
<div>
  <p></p>
  <ul>
    <li></li>
    <li></li>
  </ul>
  <span></span>
</div>
```
React 会从最外层的 <div> 节点开始遍历，遍历到它的第一个子节点 <p>，然后继续递归遍历 <p> 的子节点，如果 <p> 没有子节点，则返回到上一层节点 <div>，再继续遍历 <div> 的下一个子节点 <ul>。当遍历完 <ul> 的所有子节点之后，再返回到 <div>，继续遍历 <div> 的下一个兄弟节点 <span>。最后遍历完整棵虚拟 DOM 树，形成了 DOM 树结构。


- commit阶段
dom更新前中后阶段。执行effectList 更新dom,执行生命周期，获取ref。