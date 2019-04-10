import React, { Component } from 'react';
import { Text, FlatList, ActivityIndicator} from 'react-native';
import firebase from 'react-native-firebase';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Container,Header,Left,Body,Right,Button } from 'native-base'

import Feed from './feed';
import { Actions } from 'react-native-router-flux';

export default class HomeTab extends Component {
  constructor(props) {
    super(props)
    this.state = {
      feedList: [],
      refreshing: false,
      isLoading: false,
    }
  }

  setFeedList = (result) => {
    console.log('finish getting feed')
    console.log(result.data.feeds)
    this.setState({feedList: result.data.feeds, refreshing: false, isLoading: false})
  }

  updateFeed = () => {
    this.setState({isLoading: true})
    const getFeed = firebase.functions().httpsCallable('getFeedList')
    getFeed().then(this.setFeedList)
    .catch((err) =>{
      console.log(err)
      this.setState({feedList: result.data.feeds, refreshing: false, isLoading: false})
    }) 
  }

  componentDidMount() {
    this.updateFeed()
  }

  handleRefresh = () => {
    console.log('refresh')
    this.setState({refreshing: true}, () => {
      const getFeed = firebase.functions().httpsCallable('getFeedList')
      getFeed().then(this.setFeedList)
      .catch((err) =>{
        console.log(err)
        this.setState({feedList: result.data.feeds, refreshing: false})
      }) 
    })
  }

  messagePage = () => {
    Actions.messagePage();
  }

  render() {
    return (
      <Container style={{flex: 1, backgroundColor: 'white'}}>
        <Header>
          <Left>
          <Button transparent onPress={() => this.updateFeed()}>            
              <Icon name="refresh" size={20} style={{marginLeft: 10}} />
          </Button>
          </Left>
          <Body><Text style={{fontWeight: '500'}}>Original Finsta</Text></Body>
          <Right>
            <Button transparent onPress={() => Actions.messagePage()}>
            <Icon name="send-o" size={20} >
            </Icon>
            </Button>
          </Right>
        </Header>
          {this.state.isLoading && <ActivityIndicator animating large style={{marginTop: '50%'}}/>}
          {!this.state.isLoading &&
            <FlatList
              data={this.state.feedList}
              extraData={this.state}
              renderItem={({item}) =>
                <Feed urls={item.urls} 
                caption={item.caption} 
                username={item.username}
                timestamp={item.timestamp}
                post_id={item.post_id}
                tags={item.tags}
                comments={item.comments}
                image_url={item.image_url}
                like_count={item.like_count}
                liked={item.liked}
                tag={item.tag}
                follow={item.follow}
                other={true}
                />
              } 
              refreshing={this.state.refreshing}
              onRefresh={this.handleRefresh}
              keyExtractor={item => item.urls[0]}
              keyboardShouldPersistTaps='handled'
            />}
      </Container>
    )
  }
}
