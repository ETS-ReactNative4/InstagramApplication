import React, { Component } from 'react';
import {FlatList, ActivityIndicator, View } from 'react-native';
import firebase from 'react-native-firebase';
import { Container } from 'native-base'

import Feed from './feed';

export default class PostListTab extends Component {
  constructor(props) {
    super(props)
    console.log(props)
    this.state = {
      feedList: [],
      isLoading: false,
      other: this.props.other
    }
}

  setFeedList = (result) => {
    console.log('finish getting feed')
    console.log(result.data.feeds)
    this.setState({feedList: result.data.feeds, isLoading: false})
  }

  updateFeed = () => {
    this.setState({isLoading: true})
    if (this.props.tag) {
      const data = {tag: this.props.tag}
      console.log(data)
      const getFeed = firebase.functions().httpsCallable('getTagFeedList')
      getFeed(data).then(this.setFeedList)
      .catch((err) =>{
        console.log(err)
        this.setState({feedList: result.data.feeds, isLoading: false})
      }) 

    } else {
      const data = {uid: this.props.uid}
      console.log(data)
      const getFeed = firebase.functions().httpsCallable('getMyFeedList')
      getFeed(data).then(this.setFeedList)
      .catch((err) =>{
        console.log(err)
        this.setState({feedList: result.data.feeds, isLoading: false})
      }) 
    }
  }

  componentDidMount() {
    this.updateFeed()
  }


  render() {
    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
          {this.state.isLoading && <ActivityIndicator animating large style={{marginTop: '50%'}}/>}
          {!this.state.isLoading &&
            <FlatList
              data={this.state.feedList}
              renderItem={({item}) =>
                <Feed urls={item.urls} 
                caption={item.caption} 
                username={this.props.tag ? item.username : this.props.username}
                image_url={this.props.tag ? item.image_url : this.props.image_url}
                timestamp={item.timestamp}
                tags={item.tags}
                post_id={item.post_id}
                comments={item.comments}
                like_count={item.like_count}
                liked={item.liked}
                other={this.props.other}
                />
              } 
              keyboardShouldPersistTaps='handled'
              keyExtractor={item => item.urls[0]}
            />}
      </View>
    )
  }
}
