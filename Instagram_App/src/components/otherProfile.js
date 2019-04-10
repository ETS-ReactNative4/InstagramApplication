import React, { Component } from 'react';
import { View, Text, ActivityIndicator} from 'react-native';
import firebase from 'react-native-firebase';
import { Container,Content,Header,Left,Body,Right,Button,Thumbnail } from 'native-base'
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import Ionicon from 'react-native-vector-icons/Ionicons'
import FastImage from 'react-native-fast-image'
import { Actions } from 'react-native-router-flux';
import PhotosTab from './photosTab'
import PostListTab from './postListTab'

export default class OtherProfile extends Component {
    constructor(props) {
        super(props)

        this.state = {
            uid: '',
            username: this.props.username,
            email: "",
            fullName: "",
            gender: "",
            phoneNumber: "",
            interests: "",
            image_url: "",
            bio: "",
            follower: 0,
            followee: 0,
            post: 0,
            followState: "Follow",
            loading_count: 0,
            activeIndex: 1,
            loading_count: 0
        }
    }

    follow = () => {
      let name = 'unfollowUser'
      if (this.state.followState == 'Follow') {
        name = 'followUser'
      }
      let followUser = firebase.functions().httpsCallable(name);
      followUser({followee_uid: this.state.uid})
      .then(() => {
        console.log('followed')
        if (this.state.followState == 'Follow') {
          this.setState({followState: "Unfollow", follower: this.state.follower + 1})
        } else {
          this.setState({followState: "Follow", follower: this.state.follower - 1})
        }
      })
      .catch(error => alert(error))
    }

    setFollowState = (result) => {
      // search if already followed
      if (result.data.follow) {
        this.setState({followState: "Unfollow"})
      }
      else {
        this.setState({followState: "Follow"})
      }
      console.log(this.state.followState)
      this.setState({loading_count: this.state.loading_count + 1})
    }

    setData = (result) => {
      console.log(result.data)
      const data = result.data
      this.setState({
          uid: data.uid,
          email: data.email,
          fullName: data.fullName,
          gender: data.gender,
          phoneNumber: data.phoneNumber,
          interests: data.interests,
          bio: data.bio,
          image_url: data.image_url,
          loading_count: this.state.loading_count + 1
      })
      const follow = firebase.functions().httpsCallable('checkfollowee');
      follow({followee_uid: data.uid}).then(this.setFollowState).catch(error => alert(error))

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

    componentDidMount() {
      this.setState({loading_count: 0})
      const getInfo = firebase.functions().httpsCallable('searchByUsername');
      const data = {
        username: this.props.username,
        fields:
        ['email','fullName','gender',
        'phoneNumber','interests','bio', 'image_url']
      }
      getInfo(data).then(this.setData).catch(error => alert(error))

      let count = firebase.functions().httpsCallable('countDocsByUsername');
      count({username: this.props.username, name: 'followers'})
      .then(this.setCountFollower)
      .catch(error => alert(error))

      count({username: this.props.username, name: 'followees'})
      .then(this.setCountFollowee)
      .catch(error => alert(error))

      count({username: this.props.username, name: 'postRefs'})
      .then(this.setCountPost)
      .catch(error => alert(error))
    }


    render() {

        return (
          <Container style={{flex: 1, backgroundColor: 'white'}}>
            <Header>
              <Left>
                <Button transparent style={{marginLeft: 5}} onPress={() => Actions.pop()}>
                  <Ionicon name='ios-arrow-back' size={24} style={{color:'black'}}></Ionicon>
                </Button>
              </Left>
              <Body><Text>{this.state.username}</Text></Body>
              <Right></Right>
            </Header>
            <Content>
            {this.state.loading_count < 5 ? <ActivityIndicator animating large style={{marginTop: '50%'}}/>:
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
                    <View style={{alignItems: 'center'}}>
                      <Text>{this.state.follower}</Text>
                      <Text style={{fontSize: 10, color: 'grey'}}>followers</Text>
                    </View>
                    <View style={{alignItems: 'center'}}>
                      <Text>{this.state.followee}</Text>
                      <Text style={{fontSize: 10, color: 'grey'}}>following</Text>
                    </View>
                  </View>
                  <View style={{flexDirection: 'row', paddingTop: 20, paddingRight: 15}}>
                  <Button bordered dark
                    style={{flex: 3, marginLeft: 10,
                      justifyContent: 'center', height: 30}}
                      onPress={() => this.follow()}>
                    <Text>{this.state.followState}</Text>
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
                      <MaterialCommunityIcon name='grid' size={24} 
                      style={{color: this.state.activeIndex == 1 ? 'black': 'grey'}}/>
                    </Button>
                    <Button transparent 
                    active={this.state.activeIndex == 1}
                    onPress={()=> this.setState({activeIndex: 2})}>
                      <MaterialCommunityIcon name='format-list-bulleted' size={24}
                        style={{color: this.state.activeIndex == 2 ? 'black': 'grey'}}/>
                    </Button>
                  </View>

                </View>
                <View>
                <View>
                  {this.state.activeIndex == 1 ? <PhotosTab name={'getOtherPhotos'} uid={this.state.uid}/> : 
                  <PostListTab username={this.state.username} image_url={this.state.image_url} uid={this.state.uid} other={true} />}
                </View>
                </View>
              </View>}
            </Content>
          </Container>
        )
    }
}
