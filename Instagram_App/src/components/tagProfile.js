import React, { Component } from 'react';
import { View, Text, ActivityIndicator} from 'react-native';
import firebase from 'react-native-firebase';
import { Container,Content,Header,Left,Body,Right,Button,Thumbnail } from 'native-base'
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import FontIcon from 'react-native-vector-icons/FontAwesome'

import Ionicon from 'react-native-vector-icons/Ionicons'
import { Actions } from 'react-native-router-flux';
import PostListTab from './postListTab'

export default class TagProfile extends Component {
    constructor(props) {
        super(props)

        console.log(props)
        this.state = {
            tag: this.props.tag,
            post: 0,
            followState: "Follow",
            loading: 2,
            activeIndex: 1,
        }
    }


    componentDidMount() {
      this.setState({loading: 0})
      const getData = firebase.functions().httpsCallable('countTagPost')
      getData({tag: this.props.tag})
      .then((result) => {
        this.setState({loading: this.state.loading + 1, post: result.data.count})
      })
      .catch((err) => console.log(err))
      const checkFollow = firebase.functions().httpsCallable('checkTagFollow')
      checkFollow({tag: this.props.tag})
      .then((result) => {
        this.setState({loading: this.state.loading + 1})
        if (result.data.follow) {
          this.setState({followState: 'Unfollow'})
        }
      })
      .catch((err) => console.log(err))
    }

    followTag = () => {
      let name = 'unfollowTag'
      if (this.state.followState == 'Follow') {
        name = 'followTag'
      }
      const follow = firebase.functions().httpsCallable(name)
      follow({tag: this.props.tag})
      .then(() => {
        if (this.state.followState == 'Follow') {
          this.setState({followState: 'Unfollow'})
        }
        else {
          this.setState({followState: 'Follow'})
        }
        
      })
      .catch((err) => console.log(err))
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
              <Body><Text style={{fontWeight: 'bold', fontSize: 16}}>{this.state.tag}</Text></Body>
              <Right></Right>
            </Header>
            <Content>
            {this.state.loading < 2 ? <ActivityIndicator animating large style={{marginTop: '50%'}}/>:
              <View>
                <View style={{flexDirection: 'row', paddingTop: 20}}>
                <View style={{flex: 1}}>
                  <FontIcon style={{marginLeft: 10}} name='hashtag' size={64}></FontIcon>
                </View>
                <View style={{flex: 3}}>
                  <View style={{
                  justifyContent: 'space-around'}}>
                    <View style={{alignItems: 'center'}}>
                      <Text>{this.state.post + ' posts'}</Text>
                    </View>
                  </View>
                  <View style={{flexDirection: 'row', paddingTop: 20, paddingRight: 15}}>
                  <Button bordered dark
                    style={{flex: 3, marginLeft: 10,
                      justifyContent: 'center', height: 30}}
                      onPress={() => this.followTag()}>
                    <Text>{this.state.followState}</Text>
                  </Button>
                  </View>
                </View>
                </View>

                <View style = {{paddingTop: 20}}>
                <View>
                  <PostListTab tag={this.state.tag} other={true}/>
                </View>
                </View>
              </View>}
            </Content>
          </Container>
        )
    }
}
