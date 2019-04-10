import React, { Component } from 'react';
import { View,ActivityIndicator,FlatList,TouchableWithoutFeedback,Text,StyleSheet } from 'react-native';
import firebase from 'react-native-firebase';
import { ListItem } from 'react-native-elements'
import { Icon,Container,Content,Header,Body,Input,Item,Left,Right,Button,Thumbnail } from 'native-base'
import { Actions } from 'react-native-router-flux';
import FastImage from 'react-native-fast-image'

export default class MessagePage extends Component {

    constructor(props) {
        super(props)

        this.state = {
          followingList: [],
          isLoading: false
        };
    }

    componentDidMount() {
      this.generateList()
    }

    renderSeparator = () => {
      return (
        <View
          style={styles.renderSeparator}
        />
      );
    };


    generateList = () => {
      this.setState({isLoading: true})
      const name = 'followees'

      let followList = firebase.functions().httpsCallable('generateMessageList');
      followList({field: name})
      .then((result) => {
        console.log('list created')
        console.log(result.data.usernames)
        this.setState({followingList: result.data.usernames, isLoading: false})
        
      })
      .catch(error => alert(error))
    }


    render() {
      return (
        <Container>
          <Header hasSegment>
            <Left>
              <Button transparent onPress={()=>Actions.pop()} style={styles.backBtn}>
                <Icon name='arrow-back' style={styles.icon}></Icon>
              </Button>
            </Left>
            <Body>
              <Text>Messages</Text>
            </Body>
          <Right></Right>
          </Header>
        {this.state.isLoading ? <ActivityIndicator animating style={{marginTop: '30%'}}></ActivityIndicator> : 
        <FlatList
          data={this.state.followingList}
          renderItem={({item}) =>
          <TouchableWithoutFeedback 
            onPress={() => {
              Actions.chatScreen({
                username: item.username,
                uid: item.uid,
                image_url: item.image_url
              })
            }}>
            <ListItem
              title={item.username}
              subtitle={item.fullName}
              color='black'
              rightIcon={{name: 'send'}}
              leftIcon={item.image_url ?              
                <FastImage 
                  source={{
                    uri: item.image_url,
                    priority: FastImage.priority.normal}}
                    style={styles.thumbnail}
                  /> : 
                <Thumbnail small source={require('../images/JShine.jpg')}/>}
                subtitleStyle={styles.subtitle}
            />
          </TouchableWithoutFeedback>
          }
          ItemSeparatorComponent={this.renderSeparator}
          keyExtractor={(item, index) => index.toString()}/>
        }
        </Container>
      )
    }
}

const styles = StyleSheet.create({
  thumbnail: {
    width: 40, 
    height: 40, 
    borderRadius: 40/2
  },  
  backBtn: {
    marginLeft: 10
  },
  renderSeparator: {
    height: 1,
    width: "100%",
    backgroundColor: "#CED0CE"
  },
  icon: {
    color: 'black'
  },
  subtitle: {
    fontSize: 12, 
    color: 'grey'
  }
});