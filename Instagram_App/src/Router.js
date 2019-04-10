import React from 'react';
import {Scene, Router} from 'react-native-router-flux';
import LoginForm from './screens/LoginForm';
import SignUpForm from './screens/SignUpForm';
import Home from './screens/Home';
import FollowPage from './screens/followPage';
import MessagePage from './screens/messagePage';


import Profile from './components/Profile';
import Image from './components/createPost';
import OtherProfile from './components/otherProfile';
import TagProfile from './components/tagProfile';
import ChatScreen from './components/chatScreen';



const RouterComponent = () => {
    return (
        <Router >
            <Scene key="root">
                <Scene key="login" component={LoginForm} hideNavBar={true} initiial/>
                <Scene key="signup" component={SignUpForm} hideNavBar={true}/>
                <Scene key="home" component={Home} hideNavBar={true}/>
                <Scene key="image" component={Image} hideNavBar={true}/>
                <Scene key="profile" component={Profile} hideNavBar={true}/>
                <Scene key="otherprofile" component={OtherProfile} hideNavBar={true}/>
                <Scene key="tagprofile" component={TagProfile} hideNavBar={true}/>
                <Scene key="followPage" component={FollowPage} hideNavBar={true}/>
                <Scene key="messagePage" component={MessagePage} hideNavBar={true}/>
                <Scene key="chatScreen" component={ChatScreen} hideNavBar={true}/>
            </Scene>
        </Router>
    );
};

export default RouterComponent;
