import React, { Component } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Label,Picker,Form,Thumbnail,Container,Content,Header,Item,Button,Input,Left,Right,Body } from 'native-base';
import firebase from 'react-native-firebase';
import {Actions} from 'react-native-router-flux';
import {Overlay} from 'react-native-elements'
import ImageResizer from 'react-native-image-resizer';
import ImagePicker from 'react-native-image-crop-picker';
import FastImage from 'react-native-fast-image'
import { LoginManager } from 'react-native-fbsdk';
import { GoogleSignin } from 'react-native-google-signin';

var storage = firebase.storage();

const uploadImage = (uri, mime = 'application/octet-stream') => {
return new Promise((resolve, reject) => {
  const sessionId = new Date().getTime()
  const imageRef = storage.ref().child('thum_'+`${sessionId}`)

    imageRef.put(uri, { contentType: mime })
    .then(() => {
      return imageRef.getDownloadURL()
    })
    .then((url) => {
      resolve(url)
    })
    .catch((error) => {
      reject(error)
  })
})
}

export default class Profile extends Component {
    constructor(props) {
        super(props)
        console.log("HEY" + this.props.email)

        this.state = {
            username: this.props.username,
            email: this.props.email,
            fullName: this.props.fullName,
            gender: this.props.gender,
            phoneNumber: this.props.phoneNumber,
            interests: this.props.interests,
            bio: this.props.bio,
            selected: '',
            resizedImageUri: this.props.image_url,
            isLoading: false
        }
    }

    handleChoosePhoto = () => {
      ImagePicker.openPicker({}).then(image => {
        console.log(image)
        this.resize(image.sourceURL)
      });
    };

    resize = (image_uri) => {
      console.log(image_uri)
      ImageResizer.createResizedImage(image_uri, 170, 170, 'PNG', 100)
        .then(({ uri }) => {
          console.log(uri)
          this.setState({
            resizedImageUri: uri,
          });
        })
        .catch(err => {
          console.log(err);
          return alert('Unable to resize the photo', 'Check the console for full the error message');
        });
    }

    signOut = async () => {
      try {
        await GoogleSignin.signOut();
        await LoginManager.logOut();
        await firebase.auth().signOut();
      } catch (error) {
        console.error(error);
      }
      alert("User signed out")
      Actions.login();
    };

    logOut() {
      this.signOut()
    }

    saveChanges = () => {
      this.setState({isLoading: true})
      if (this.state.resizedImageUri == this.props.image_url) {
        var saveInfo = firebase.functions().httpsCallable('changeInfo');
        saveInfo({
          username: this.state.username,
          phoneNumber: this.state.phoneNumber,
          bio: this.state.bio,
          fullName: this.state.fullName,
          gender: this.state.gender,
          interests: this.state.interests,
          image_url: this.state.resizedImageUri
        }).then(() => {
          this.setState({isLoading: false})
          Actions.home({email: this.state.email, tab: 'person'})
        })
        .catch(() => console.log('change'))
      } 
      else {
        uploadImage(this.state.resizedImageUri)
        .then(url => {
          console.log(url)
          var saveInfo = firebase.functions().httpsCallable('changeInfo');
          saveInfo({
            username: this.state.username,
            phoneNumber: this.state.phoneNumber,
            bio: this.state.bio,
            fullName: this.state.fullName,
            gender: this.state.gender,
            interests: this.state.interests,
            image_url: url
          }).then(() => {
            this.setState({isLoading: false})
            Actions.home({email: this.state.email, tab: 'person'})
          })
          .catch(() => console.log('change'))
  
        })
        .catch(error => alert(error))
      }
    }

    onValueChange = (value) => {
      this.setState({
          selected: value
      });
      console.log(value)
  }

    render() {
        return (
          <Container style={{flex: 1, backgroundColor: 'white'}}>
            <Header>
              <Left>
                <Button transparent onPress={() => Actions.pop()}
                  style={{marginLeft: 10}}
                  accessibilityLabel="Touch this button to cancel">
                  <Text style={{color: '#333'}}>Cancel</Text>
                </Button>
              </Left>
              <Body>
                <Text>Edit Profile</Text>
              </Body>
              <Right>
                <Button transparent onPress={() => this.saveChanges()}
                  style={{marginLeft: 10}}
                  accessibilityLabel="Touch this button to save">
                  <Text style={{color: '#007AFF'}}>Done</Text>
                  </Button>
              </Right>
            </Header>
            {this.state.isLoading && 
        <Overlay width={130} height={60}>
        <View style={{flexDirection: 'row'}}>
          <ActivityIndicator />
          <Text style={{padding: 10}}>Saving...</Text> 
        </View>
        </Overlay>}
            <Content style={{marginTop: 20}}>
              <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                <View>
                {(this.state.resizedImageUri && this.state.resizedImageUri != "") ? 
                  <FastImage 
                  source={{
                  uri: this.state.resizedImageUri,
                  priority: FastImage.priority.normal}}
                  style={{width: 80, height: 80, borderRadius: 40, marginLeft: 10}}
                /> :
                  <Thumbnail large source={require('../images/JShine.jpg')}
                  style={{marginLeft: 10}}/>
                  }                     
                </View>
              </View>
              <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                  <Button transparent onPress={() => this.handleChoosePhoto()}>
                    <Text style={{color: '#007AFF'}}>Change Profile Photo</Text>
                  </Button>
                </View>
              <Form>
                <Item fixedLabel>
                  <Label>Username</Label>
                  <Input placeholder="Username"
                  autoCapitalize = "none"
                  onChangeText={(username) => {
                      this.setState({
                          username
                      })}
                  }
                  value={this.state.username}/>
                </Item>
                <Item fixedLabel>
                <Label>Name</Label>
                    <Input placeholder="Name"
                    onChangeText={(fullName) => {
                        this.setState({
                            fullName
                        })}
                    }
                    value={this.state.fullName}/>
                </Item>
                <Item inlineLabel>
                <Label>Gender</Label>
                  <Picker style={{marginLeft: '22%'}}
                    placeholder="Gender"
                    placeholderStyle={{ color: "#ccc" }}
                    iosHeader="Choose Gender"
                    mode="dropdown"
                    selectedValue={this.state.gender}
                    onValueChange={(gender) => {
                      this.setState({
                          gender
                    })}}>
                    <Item label="Not Specified" value="Not Specified" />
                    <Item label="Male" value="Male" />
                    <Item label="Female" value="Female" />
                  </Picker>
                </Item>
                <Item fixedLabel>
                <Label>Phone Number</Label>
                    <Input placeholder="Phone number"
                    onChangeText={(phoneNumber) => {
                        this.setState({
                            phoneNumber
                        })}
                    }
                    value={this.state.phoneNumber}/>
                </Item>
                <Item fixedLabel>
                <Label>Bio</Label>
                   <Input placeholder="Add Bio"
                   onChangeText={(bio) => {
                       this.setState({
                           bio
                       })}
                   }
                   value={this.state.bio}/>
                </Item>
                <Item fixedLabel last>
                <Label>Interests</Label>
                    <Input placeholder="Interests"
                    onChangeText={(interests) => {
                        this.setState({
                            interests
                        })}
                    }
                    value={this.state.interests}/>
                </Item>

                <Button transparent onPress={() => this.logOut()}
                  style={{marginLeft: 20}}
                  accessibilityLabel="Touch this button to log out">
                  <Text style={{color: '#007AFF'}}>Log Out</Text>
                </Button>
              </Form>

            </Content>
          </Container>
        )
    }
}
