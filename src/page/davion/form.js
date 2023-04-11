// eslint ignore
// import React from 'react'


// function Input(props){
//     const {value,onChange} = props
//     return (
//         <input
//             onChange={(e) => { onChange(e.target.value) }}
//             value={value}
//         />)
// }

// function FormItem(props){
//     const {label,children,value,handleChange,prop} = props
//     const onChange = (value) => {
//         /* 通知上一次value 已经改变 */
//         handleChange(prop,value)
//     }
//     const c = React.cloneElement(children,{ onChange , value })

//     return <div className='formItem'>
//           <span className="label" >{label}:</span>  
//           {
//              c
//           }
//     </div>
// }
// FormItem.__COMPONENT_TYPE = 'formItem'


// class Form extends React.Component{
//     constructor(props){
//         super(props)
//     }
//     state={
//         formData:{}
//     }
//     submitForm = (fn)=>{
//         fn(this.state.formData)
//     }
//     resetForm = ()=>{
//        const { formData } = this.state
//        Object.keys(formData).forEach(item=>{
//            formData[item] = ''
//        })
//        this.setState({
//            formData
//        })
//     }
//     setValue=(prop,value)=>{
//         this.setState({
//             formData:{
//                 ...this.state.formData,
//                 [prop]:value
//             }
//         })
//     }
//     render(){
//         const {children} = this.props
//         const renderChildren = []
//         React.Children.forEach(children,(item)=>{
//             if(item.type.__COMPONENT_TYPE!=='formItem')return
//             const prop = item.props.prop
//             const Children = React.cloneElement(item,{
//                 key:prop,
//                 handleChange:this.setValue,
//                 value:this.state.formData[prop] ||  '',
//             }, item.props.children)
            
//             renderChildren.push(Children)
//         })
//         return renderChildren
//     }
// }
// export default ()=>{
//     const formRef = React.useRef(null)
//     const submit = ()=>{
//         console.log("🚀 ~ file: form.js ~ line 72 ~ form", formRef) 
//         formRef.current.submitForm((v)=>{
//             console.log(v)
//         })   
//     }
//     const reset = ()=>{
//         /* 表单重置 */
//         formRef.current.resetForm()
//     }
//     return (
//         <div>
//             <Form ref={formRef}>
//                 <FormItem label='用户名' prop='user'>
//                     <Input></Input>
//                 </FormItem>

//                 <FormItem label='密码' prop='psd'>
//                     <Input></Input>
//                 </FormItem>
//             </Form>
//             <div className="btns" >
//                 <button className="searchbtn"
//                     onClick={submit}
//                 >提交</button>
//                 <button className="concellbtn"
//                     onClick={reset}
//                 >重置</button>
//             </div>
//         </div>
//     )
// }