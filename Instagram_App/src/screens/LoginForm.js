import React, { Component } from 'react';
import { ImageBackground, View, Keyboard, TouchableWithoutFeedback } from 'react-native';
import Header from '../components/header'
import SignIn from '../components/signIn'

export default class LoginForm extends Component {

  constructor(props) {
    super(props);
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
      <TouchableWithoutFeedback style={{flex:1}} onPress={Keyboard.dismiss}>
      <ImageBackground
        source={require('../images/JShine.jpg')}
        style={{ width: '100%', height: '100%' }}
      >
        <Header />
        <View style={inputBox}>
          <SignIn />
        </View>
      </ImageBackground>
      </TouchableWithoutFeedback>
    );
  }


}
