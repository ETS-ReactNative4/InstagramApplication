import React, { Component } from 'react';
import { View,ActivityIndicator,FlatList,TouchableWithoutFeedback,Text,StyleSheet } from 'react-native';
import firebase from 'react-native-firebase';
import { ListItem } from 'react-native-elements'
import { Icon,Container,Header,Body,Left,Right,Button,Segment,Thumbnail } from 'native-base'
import { Actions } from 'react-native-router-flux';
import FastImage from 'react-native-fast-image'

export default class FollowPage extends Component {

    constructor(props) {
        super(props)
        console.log(props)

        this.state = {
          selected: this.props.selected,
          followerList: [],
          followingList: [],
          isLoading: false
        };
    }

    componentDidMount() {
      this.generateList(this.state.selected)
    }

    renderSeparator = () => {
      return (
        <View
          style={{
            height: 1,
            width: "95%",
            backgroundColor: "#CED0CE",
            marginLeft: "5%"
          }}
        />
      );
    };


    generateList = (selected) => {
      this.setState({isLoading: true})
      let name = ''
      if (selected == 1) {
        name = 'followers'
      } 
      else {
        name = 'followees'
      }

      let followList = firebase.functions().httpsCallable('generateFollowList');
      followList({field: name})
      .then((result) => {
        console.log('list created')
        console.log(result.data.usernames)
        this.setState({isLoading: false})
        if (selected == 1) {
          this.setState({followerList: result.data.usernames})
        }
        else {
          this.setState({followingList: result.data.usernames})
        }
      })
      .catch(error => alert(error))
    }


    render() {
      return (
        <Container>
          <Header hasSegment>
            <Left>
              <Button transparent onPress={()=>Actions.pop()}>
                <Icon name='arrow-back' style={{color: 'black'}}></Icon>
              </Button>
            </Left>
            <Body>
              <Text>{this.props.username}</Text>
            </Body>
          <Right></Right>
          </Header>
          <Segment>
            <Button block first 
              active={this.state.selected == 1} 
              onPress={() => {
                this.setState({ selected: 1 })
                this.generateList(1)
              }}
              style={{padding: 10, paddingHorizontal: '15%', 
              borderColor: 'transparent', backgroundColor: 'transparent',
              borderBottomColor: this.state.selected == 1 ? "black" : undefined
            }}>
              <Text style={{color: this.state.selected == 1 ? "black" : 'grey'}}>Followers</Text>
            </Button>
            <Button block last 
              active={this.state.selected == 2} 
              onPress={() => {
                this.setState({ selected: 2 })
                this.generateList(2)
              }}
              style={{padding: 10, paddingHorizontal: '15%',
              borderColor: 'transparent', backgroundColor: 'transparent',
              borderBottomColor: this.state.selected == 2 ? "black" : undefined}}>
              <Text style={{color: this.state.selected == 2 ? "black" : 'grey'}}>Following</Text>
            </Button>
          </Segment>
          {this.isLoading ? <ActivityIndicator animating /> :
        <FlatList
          data={this.state.selected == 1 ? this.state.followerList : this.state.followingList}
          renderItem={({item}) =>
          <TouchableWithoutFeedback 
          onPress={() => Actions.otherprofile({username: item.username})}>
            <ListItem
              title={item.username}
              subtitle={item.fullName}
              color='black'
              rightIcon={{name: 'arrow-forward'}}
              leftIcon={item.image_url ?              
                <FastImage 
                  source={{
                    uri: item.image_url,
                    priority: FastImage.priority.normal}}
                    style={styles.thumbnail}
                  /> : 
                <Thumbnail small source={require('../images/JShine.jpg')}/>}
                subtitleStyle={{fontSize: 12, color: 'grey'}}
                color='black'
                rightIcon={{name: 'arrow-forward'}}
            />
          </TouchableWithoutFeedback>
          }
          ItemSeparatorComponent={this.renderSeparator}
          keyExtractor={(item, index) => index.toString()}/>}
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
});