import React, { Component } from 'react';
import { View, TextInput, Button, TouchableWithoutFeedback, Keyboard } from 'react-native';
import firebase from 'react-native-firebase';
import { SocialIcon } from 'react-native-elements'
import { AccessToken, LoginManager } from 'react-native-fbsdk';
import { GoogleSignin } from 'react-native-google-signin';
import {Actions} from 'react-native-router-flux';
const FCM = firebase.messaging();

export default class SignIn extends Component {

  constructor(props) {
    super(props);
    this.state = {
      text: "Username",
      textPassword: "Password",
      backgroundColor: 'white',
      username: " ",
      password: " "
    }
  }

  onBlur() {
    this.setState({
      backgroundColor: 'white'
    })
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        FCM.requestPermission();
        FCM.getToken().then(token => {
          console.log(token)
          firebase.firestore().collection('users').doc(user.uid).update({ pushToken: token });
        });
        Actions.home({email: user.email, tab: 'home'});
      } else {
        // No user is signed in.
      }
    });
  }


  loginButton(username, password) {
    firebase.auth().signInWithEmailAndPassword(username, password).then( (user) => {
      console.log(user.user.email)
    })
    .catch((error) => {
      alert(error)
      console.log(error.toString())
    })
  }

  signUpButton() {
    Actions.signup();
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
        marginTop: 30,
        borderRadius: 25,
        paddingLeft: 20,
        width: 200,
        backgroundColor: this.state.backgroundColor
      }
    }
    const { viewStyle, inputBoxStyles } = styles;

    return (
      <TouchableWithoutFeedback style={{flex:1}} onPress={Keyboard.dismiss}>
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
          onChangeText={(username) => {
            this.setState({
              username
            })
          }}
          placeholder="Email"
        />
        <TextInput
          autoCapitalize = "none"
          style={inputBoxStyles}
          secureTextEntry={true}
          returnKeyType='done'
          ref={input => {
            this.passwordRef = input;
          }}
          onChangeText={(password) => {
            this.setState({
              password
            })
          }}
          placeholder="Password"
        />
        <View style={{marginTop: 10,}}>
        <Button
          onPress={() => this.loginButton(this.state.username, this.state.password)}
          title="Log In"
          color="white"
          accessibilityLabel="Press here to submit info for sign in!" />
        </View>
        <View style={{marginBottom: 10,}}>
        <Button
          onPress={() => this.signUpButton()}
          title="Sign Up Now!"
          color="white"
          accessibilityLabel="Press here to sign up for an account!" />
        </View>
        <View style={{flexDirection: 'row',}}>
        <SocialIcon
          button
          light
          type='facebook' 
          style={{paddingHorizontal: 20}}
          onPress={() => facebookLogin()}>
        </SocialIcon>
        <SocialIcon   
          button
          light
          type='google' 
          style={{paddingHorizontal: 16}}
          onPress={() => googleLogin()}>
        </SocialIcon>
        </View>

      </View>
      </TouchableWithoutFeedback>
    )
  }
}

// Calling the following function will open the FB login dialogue:
export async function facebookLogin() {
  try {
    const result = await LoginManager.logInWithReadPermissions(['public_profile', 'email']);

    if (result.isCancelled) {
      // handle this however suites the flow of your app
      console.log('User cancelled request'); 
      return
    }

    console.log(`Login success with permissions: ${result.grantedPermissions.toString()}`);

    // get the access token
    const data = await AccessToken.getCurrentAccessToken();

    if (!data) {
      // handle this however suites the flow of your app
      throw new Error('Something went wrong obtaining the users access token');
    }

    console.log(data)

    // create a new firebase credential with the token
    const credential = firebase.auth.FacebookAuthProvider.credential(data.accessToken);

    // login with credential
    const firebaseUserCredential = await firebase.auth().signInWithCredential(credential);

    console.log(firebaseUserCredential.user)
    firebase.firestore().collection('users').doc(firebaseUserCredential.user.uid).set(
      {
          username: firebaseUserCredential.user.email,
          email: firebaseUserCredential.user.email,
          fullName: firebaseUserCredential.user.displayName,
          gender: "",
          phoneNumber: "",
          interests: "",
          bio: "",
          image_url: firebaseUserCredential.user.photoURL
      }).then(() => {
        console.log("INSERTED! ");
      }).catch((error) => {
        console.log(error);
      })
  } catch (e) {
    console.error(e);
  }
}

// Calling this function will open Google for login.
export async function googleLogin() {
  try {
    // add any configuration settings here:
    await GoogleSignin.configure();

    const data = await GoogleSignin.signIn();

    // create a new firebase credential with the token
    const credential = firebase.auth.GoogleAuthProvider.credential(data.idToken, data.accessToken)
    // login with credential
    const firebaseUserCredential = await firebase.auth().signInWithCredential(credential);

    console.log(firebaseUserCredential.user)
    firebase.firestore().collection('users').doc(firebaseUserCredential.user.uid).set(
      {
          username: firebaseUserCredential.user.email,
          email: firebaseUserCredential.user.email,
          fullName: firebaseUserCredential.user.displayName,
          gender: "",
          phoneNumber: "",
          interests: "",
          bio: "",
          image_url: firebaseUserCredential.user.photoURL
      }).then(() => {
        console.log("INSERTED! ");
      }).catch((error) => {
        console.log(error);
      })
  } catch (e) {
    console.error(e);
  }
}