# jsx
createElement 把上面写的 jsx，变成 element 对象; 而 cloneElement 的作用是以 element 元素为样板克隆并返回新的 React element 元素

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
// 0, 0, 0, callback1 1 ,callback2 1 ,callback3 1
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
`constructor -> getDerivedStateFroProps / componentWillMount -> render -> componentDidMount`
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
## 提供
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
```js
### ThemeContext.Consumer
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