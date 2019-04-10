import React, { Component } from 'react';
import { View, Text, TouchableWithoutFeedback, ActivityIndicator, RefreshControl} from 'react-native';
import firebase from 'react-native-firebase';
import { Container,Content,Header,Body,Button,Thumbnail} from 'native-base'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import {Actions} from 'react-native-router-flux';
import FastImage from 'react-native-fast-image'
import PhotosTab from './photosTab'
import PostListTab from './postListTab'

export default class DisplayProfile extends Component {
    constructor(props) {
        super(props)
        console.log("HEY" + this.props.email)

        this.state = {
            username: "",
            email: this.props.email,
            fullName: "",
            gender: "",
            phoneNumber: "",
            interests: "",
            bio: "",
            image_url: "",
            follower: 0,
            followee: 0,
            post: 0,
            activeIndex: 1,
            loading_count: 0,
            init: true
        }
    }

    _onRefresh = () => {
      this.setState({init: false})
      this.updateData()
    }
  

    setData = (result) => {
      console.log(result.data)
      const data = result.data
      this.setState({
          username: data.username,
          email: data.email,
          fullName: data.fullName,
          gender: data.gender,
          phoneNumber: data.phoneNumber,
          interests: data.interests,
          bio: data.bio,
          image_url: data.image_url,
          loading_count: this.state.loading_count + 1
      })
    }

    setCountFollower = (result) => {
      console.log('count follower')
      console.log(result.data)
      const size = result.data.count

      this.setState({follower: size, loading_count: this.loading_count + 1})
    }

    setCountFollowee = (result) => {
      console.log('count followee')
      console.log(result.data)
      const size = result.data.count

      this.setState({followee: size, loading_count: this.loading_count + 1})
    }

    setCountPost = (result) => {
      console.log('count post')
      console.log(result.data)
      const size = result.data.count

      this.setState({post: size, loading_count: this.loading_count + 1})
    }

    updateData = () => {
      this.setState({loading_count: 0})
      let getInfo = firebase.functions().httpsCallable('getInfo');
      let data = {
        fields:
        ['username','email','fullName','gender',
        'phoneNumber','interests','bio','image_url']
      }
      getInfo(data).then(this.setData).catch(error => alert(error))

      let count = firebase.functions().httpsCallable('countDocs');
      count({name: 'followers'})
      .then(this.setCountFollower)
      .catch(error => alert(error))

      count({name: 'followees'})
      .then(this.setCountFollowee)
      .catch(error => alert(error))

      count({name: 'postRefs'})
      .then(this.setCountPost)
      .catch(error => alert(error))
    }

    componentDidMount() {
      this.updateData()
    }

    render() {
        return (
          <Container style={{flex: 1, backgroundColor: 'white'}}>
            <Header>
              <Body><Text>{this.state.username}</Text></Body>
            </Header>
            <Content
            refreshControl={
              <RefreshControl
                refreshing={this.state.loading_count < 4 && !this.state.init}
                onRefresh={this._onRefresh}
              />
            }>
            {this.state.loading_count < 4 && this.state.init ? <ActivityIndicator animating large style={{marginTop: '50%'}}/>:
              <View>
                <View style={{flexDirection: 'row', paddingTop: 20}}>
                <View style={{flex: 1}}>
                  {(this.state.image_url && this.state.image_url != "") ? 
                  <FastImage 
                    source={{
                    uri: this.state.image_url,
                    priority: FastImage.priority.normal}}
                    style={{width: 80, height: 80, borderRadius: 40, marginLeft: 10}}
                  /> :
                  <Thumbnail large source={require('../images/JShine.jpg')}
                  style={{marginLeft: 10}}/>
                  }
                  
                </View>
                <View style={{flex: 3}}>
                  <View style={{flexDirection: 'row',
                  justifyContent: 'space-around'}}>
                    <View style={{alignItems: 'center'}}>
                      <Text>{this.state.post}</Text>
                      <Text style={{fontSize: 10, color: 'grey'}}>posts</Text>
                    </View>
                    <TouchableWithoutFeedback onPress={()=>Actions.followPage({username: this.state.username, selected: 1})}>
                    <View style={{alignItems: 'center'}}>
                      <Text>{this.state.follower}</Text>
                      <Text style={{fontSize: 10, color: 'grey'}}>followers</Text>
                    </View>
                    </TouchableWithoutFeedback>
                    <TouchableWithoutFeedback onPress={()=>Actions.followPage({username: this.state.username, selected: 2})}>
                    <View style={{alignItems: 'center'}}>
                      <Text>{this.state.followee}</Text>
                      <Text style={{fontSize: 10, color: 'grey'}}>following</Text>
                    </View>
                    </TouchableWithoutFeedback>
                  </View>
                  <View style={{flexDirection: 'row', paddingTop: 20, paddingRight: 15}}>
                    <Button bordered dark
                      style={{flex: 3, marginLeft: 10,
                        justifyContent: 'center', height: 30}}
                      onPress={() => Actions.profile(this.state)}
                    >
                      <Text>Edit Profile</Text>
                    </Button>
                  </View>
                </View>
                </View>
                <View style={{paddingVertical: 10, paddingHorizontal: 10}}>
                  <Text style={{fontWeight: 'bold'}}>{this.state.fullName}</Text>
                  <Text>{this.state.bio}</Text>
                  <Text>{this.state.interest}</Text>
                </View>

                <View>
                  <View style = {{flexDirection: 'row', justifyContent: 'space-around',
                                  borderTopWidth: 1, borderColor: '#eee', borderBottomWidth: 1}}>
                    <Button transparent 
                    active={this.state.activeIndex == 1}
                    onPress={()=> this.setState({activeIndex: 1})}>
                      <Icon name='grid' size={24} 
                      style={{color: this.state.activeIndex == 1 ? 'black': 'grey'}}/>
                    </Button>
                    <Button transparent 
                    active={this.state.activeIndex == 1}
                    onPress={()=> this.setState({activeIndex: 2})}>
                      <Icon name='format-list-bulleted' size={24}
                        style={{color: this.state.activeIndex == 2 ? 'black': 'grey'}}/>
                    </Button>
                  </View>

                </View>
                <View>
                  {this.state.activeIndex == 1 ? <PhotosTab name={'getPhotos'}/> : 
                  <PostListTab username={this.state.username} image_url={this.state.image_url} other={false} />}
                </View>
              </View>}
            </Content>
          </Container>
        )
    }
}
