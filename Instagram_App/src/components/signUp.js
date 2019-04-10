import React, { Component } from 'react';
import { View, TextInput,Text } from 'react-native';
import firebase from 'react-native-firebase';
import {Actions} from 'react-native-router-flux';
import {Button} from 'native-base'

export default class SignUp extends Component {

  constructor(props) {
    super(props);
    this.state = {
      backgroundColor: 'white',
      email: "",
      username: "",
      password: ""
    }
  }

  onBlur() {
    this.setState({
      backgroundColor: 'white'
    })
  }

  signUpButton = () => {
    try {
      if (this.state.password.length < 6) {
        alert("Please enter at least 6 characters for your password")
        return
      }
      console.log(this.state)
      firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password).then(() => {
          let user = firebase.auth().currentUser
          console.log(user.uid)
          firebase.firestore().collection('users').doc(user.uid).set(
          {
              username: this.state.username,
              email: this.state.email,
              fullName: "",
              gender: "",
              phoneNumber: "",
              interests: "",
              bio: "",
              image_url: ""
          }).then(() => {
            console.log("INSERTED! ");
          }).catch((error) => {
            console.log(error);
          })
      })
    }
    catch (error) {
      console.log(error.toString())
    }
  }

  render() {
    const styles = {
      inputStyles: {
        height: 40,
        width: 100,
        borderColor: 'gray',
        borderWidth: 1
      },
      viewStyle: {
        justifyContent: 'center',
        alignItems: 'center'
      },
      inputBoxStyles: {
        height: 40,
        marginTop: 15,
        marginBottom: 15,
        borderRadius: 20,
        paddingLeft: 10,
        width: 200,
        backgroundColor: this.state.backgroundColor
      }
    }
    const { viewStyle, inputBoxStyles } = styles;

    return (
      <View style={viewStyle}>
        <TextInput
          keyboardType = 'email-address'
          autoCapitalize = "none"
          style={inputBoxStyles}
          returnKeyType='next'
          blurOnSubmit={false}
          ref={input => {
            this.usernameRef = input;
          }}
          onSubmitEditing={() => {
            this.passwordRef.focus();
          }}
          onChangeText={(email) => {
            this.setState({
              email: email
            })
          }}
          placeholder="Email"
        />
        <TextInput
          autoCapitalize = "none"
          style={inputBoxStyles}
          secureTextEntry={true}
          returnKeyType='next'
          blurOnSubmit={false}
          ref={input => {
            this.passwordRef = input;
          }}
          onSubmitEditing={() => {
            this.usernameRef.focus();
          }}
          onChangeText={(password) => {
            this.setState({
              password: password
            })
          }}
          placeholder="Password"
        />
        <TextInput
          autoCapitalize = "none"
          style={inputBoxStyles}
          returnKeyType='done'
          ref={input => {
            this.usernameRef = input;
          }}
          onChangeText={(username) => {
            this.setState({
              username: username
            })
            console.log(username)
          }}
          placeholder="Username"
        />


        <Button transparent block
          onPress={() => this.signUpButton()}
          color="white">
          <Text style={{color: 'white', fontSize: 15}}>Sign Up</Text>
        </Button>

        <Text style={{color: 'white', fontSize: 15, marginTop: 50, marginBottom: 5}}>Already have an account?</Text>

        <Button transparent block
          onPress={() => Actions.pop()}
          color="white">
          <Text style={{color: 'white', fontSize: 15}}>Sign In Now!</Text>
        </Button>
      </View>
    )
  }
}
