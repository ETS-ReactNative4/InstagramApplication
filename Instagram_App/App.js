import React, { Component } from 'react';
import { ImageBackground, View } from 'react-native';
import * as firebase from 'firebase'
// import firebase from 'firebase'
import Header from './src/components/header'
import SignIn from './src/components/signIn'
import {createAppContainer,createStackNavigator} from 'react-navigation';

class LoginScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      introMessage: "______"
    }
  }

  componentWillMount() {
    const config = {
      apiKey: "AIzaSyCYI9iCvEzDZk6jezcmyy6CVQfFzsZpslo",
      authDomain: "ecs165a-finsta-dc4be.firebaseapp.com",
      databaseURL: "https://ecs165a-finsta-dc4be.firebaseio.com",
      projectId: "ecs165a-finsta-dc4be",
      storageBucket: "ecs165a-finsta-dc4be.appspot.com",
      messagingSenderId: "516695316822"
    };

    firebase.initializeApp(config);
  }


  render() {

    const styles = {
      inputBox: {
        marginTop: 100,
        justifyContent: 'center',
        alignItems: 'center'
      }
    }

    const { inputBox } = styles;
    return (
      <ImageBackground
        source={require('./src/images/JShine.jpg')}
        style={{ width: '100%', height: '100%' }}
      >
        <Header nameProp={this.state.introMessage} />
        <View style={inputBox}>
          <SignIn />
        </View>
      </ImageBackground>
    );
  }
}

const AppNavigator = createStackNavigator({
  Login: {
    screen: LoginScreen
  }
})

const AppContainer = createAppContainer(AppNavigator);

export default AppContainer;
