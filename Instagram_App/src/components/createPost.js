import React from 'react';
import { View, Text, ActivityIndicator,StyleSheet,Dimensions,ScrollView} from 'react-native';
import { Overlay } from 'react-native-elements';
import FastImage from 'react-native-fast-image';

import firebase from 'react-native-firebase';
import ImagePicker from 'react-native-image-crop-picker';
import { Form, Container, Content, Header, Left, Body, Right, Button, Input, Item } from 'native-base'
import { Actions } from 'react-native-router-flux';
const {width} = Dimensions.get('window')

var storage = firebase.storage();

const uploadImage = (uri, mime = 'application/octet-stream') => {
return new Promise((resolve, reject) => {
  const sessionId = new Date().getTime()
  const imageRef = storage.ref().child(`${sessionId}`)

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

export default class Post extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      photo: null,
      caption: null,
      tag: null,
      isLoading: false
    };
   }

  handleChoosePhoto = () => {
    ImagePicker.openPicker({
      multiple: true,
    }).then(images => {
      console.log(images)
      this.setState({ photo: images })
    });
  };


  handleTakePhoto = () => {
    ImagePicker.openCamera({
      width: 300,
      height: 300,
      cropping: true,
    }).then(image => {
      this.setState({ photo: [image] })

    });
  };

  createPost = async () => {
    this.setState({isLoading: true})
    let photo
    let urls = []
    for (photo of this.state.photo) {
      const url = await uploadImage(photo.path)
      if (url) {
        urls.push(url)
      }
    }

    let data = { urls: urls,
      caption: this.state.caption,
      tags: this.state.tag? this.state.tag.split(' '):null
    }

    console.log(data)
    let create = firebase.functions().httpsCallable('createPost');
    create(data)
    .then(() => {
      console.log('post created')
      this.setState({isLoading: false})
      Actions.home({tab: 'home'})
    })
    .catch(error => alert(error))
  }

  render() {
    const { photo } = this.state;
    return (
      <Container>
        <Header>
          <Left>
            <Button transparent onPress={() => Actions.pop()} style={styles.leftIcon}>
              <Text>Cancel</Text>
            </Button>
          </Left>
          <Body>
            <Text>New Post</Text>
          </Body>
          <Right>
            <Button transparent onPress={() => this.createPost()} >
              <Text>Share</Text>
            </Button>
          </Right>
        </Header>
        <Overlay width={130} height={60} isVisible={this.state.isLoading}>
        <View style={styles.flexRow}>
          <ActivityIndicator />
          <Text style={styles.overlay}>Sharing...</Text> 
        </View>
        </Overlay>
        <Content>
          <View>
            {photo ? (
             <ScrollView style={styles.wrapper} 
             horizontal={true} 
             pagingEnabled={true}
             decelerationRate={0}
             snapToInterval={300 + (width-300)/4}
             >
             {this.state.photo.map((item, index) => {
               return (  
                 <View style={{       
                  height: 300, width: 300, flex: 1,     
                  marginHorizontal: 10, 
                  marginLeft: index == 0 ? (width-300)/2: 10,
                  marginRight: index == this.state.photo.length-1 ? (width-300)/2: 10,       
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 7,
                  },
                 shadowOpacity: 0.41,
                 shadowRadius: 9.11, }}> 
               <FastImage 
                 source={{
                   uri: item.path,
                   priority: FastImage.priority.normal
                 }} 
                 key={index+item.path}
                 style={{height: 300, width: 300}}/>
                </View>   
                )
             })}
             </ScrollView>
          ): <View style={styles.imageHolder}></View>}
            <Button block light onPress={() => this.handleChoosePhoto()}>
              <Text>Choose Photo</Text>
            </Button>
            <Button block light onPress={() => this.handleTakePhoto()}>
              <Text>Take Photo</Text>
            </Button>
          </View>
          <Form>
          <Item>
            <Input fixedLabel placeholder="Add Caption"
               ref={input => {
                this.captionRef = input;
              }}
              onSubmitEditing={() => {
                this.hashtagRef._root.focus();
              }}
              blurOnSubmit={false}
              style={styles.input}
              returnKeyType="next"
              onChangeText={(caption) => {
                this.setState({
                  caption
                })
              }}
            />
          </Item>
          <Item last>
            <Input fixedLabel placeholder="Add Hashtag"
              style={styles.input}
              ref={input => {
                this.hashtagRef = input;
              }}
              returnKeyType="done"
              onChangeText={(tag) => {
              this.setState({
                tag
              })}}>
            </Input>
          </Item>
          </Form>
        </Content>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  leftIcon: {
    marginLeft: 10
  },
  flexRow: {
    flexDirection: 'row'
  },
  overlay: {
    padding: 10
  },
  image: { 
    width: 300, 
    height: 300 
  },
  imageHolder: {
    height: 400
  }, 
  input: {
    fontSize: 15, 
    marginLeft: 5
  },
  wrapper: {
    height: width,
    marginTop: 50,
  }
});