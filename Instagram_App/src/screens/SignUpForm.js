import React, { Component } from 'react';
import { ImageBackground, View, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView } from 'react-native';
import Header from '../components/header'
import SignUp from '../components/signUp'

export default class SignUpForm extends Component {

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
      <KeyboardAvoidingView>
      <ImageBackground
        source={require('../images/JShine.jpg')}
        style={{ width: '100%', height: '100%' }}
      >
        <Header />
        <View style={inputBox}>
          <SignUp />
        </View>
      </ImageBackground>
      </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    );
  }


}
