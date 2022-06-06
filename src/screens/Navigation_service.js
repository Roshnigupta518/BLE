// import {NavigationActions} from '@react-navigation/native';

// let _navigator;

// function setTopLevelNavigator(navigatorRef) {
// 	_navigator = navigatorRef;
// }

// function navigate(routeName, params) {
// 	console.log('-->', routeName,params)
// 	_navigator.navigate(routeName,params);
//     _navigator.dispatch(
//         NavigationActions.navigate({
//             routeName, params
//         })
//     )
// }

// function goBack() {
// 	_navigator.dispatch(NavigationActions.back());
// }


// export default {
// 	navigate,
// 	setTopLevelNavigator,
// 	goBack,
// };


import * as React from 'react';

export const navigationRef = React.createRef();

export function navigate(name, params) {
    navigationRef.current?.navigate(name, params);
}