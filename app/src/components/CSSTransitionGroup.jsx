import React from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';


// module.exports = class CSSTransitionGroup extends React.Component {
//     render() {
//         const {transitionName, transitionLeaveTimeout, transitionEnterTimeout, children} = this.props

//         const items = (children && children.length > 0)
//             ? children.map((item, i) => (
//                 <CSSTransition
//                 key={i}
//                 timeout={{exit: transitionLeaveTimeout, enter: transitionEnterTimeout}}
//                     classNames={transitionName}
//                 >
//                     {item}
//                 </CSSTransition>
//             ))
//             : null
//         return (
//         <TransitionGroup>
//             {items}
//         </TransitionGroup>
//         )
//     }
// }


module.exports = function CSSTransitionGroup (props) {
    return (props && props.children !== undefined) ? props.children : null

  }

// module.exports = function CSSTransitionGroup (props, x) {
//     const {transitionName, transitionLeaveTimeout, transitionEnterTimeout, children} = props
//     console.log(x)
//     const items = (children && children.length > 0)
//         ? children.map((item, i) => (
//             <CSSTransition
//                 timeout={{exit: transitionLeaveTimeout, enter: transitionEnterTimeout}}
//                 classNames={transitionName}
//             >
//                 {item}
//             </CSSTransition>
//         ))
//         : null
//     return (
//       <TransitionGroup>
//         {items}
//       </TransitionGroup>
//     )
//   }