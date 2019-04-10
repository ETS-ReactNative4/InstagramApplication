import React, { Component } from 'react';
import { Text, FlatList, View, TouchableWithoutFeedback, StyleSheet, Dimensions, SafeAreaView, ScrollView, Animated} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {Overlay} from 'react-native-elements'
import { Left,Body,Button,Card,CardItem,Thumbnail,Item,Input, Right} from 'native-base'
import { Actions } from 'react-native-router-flux';
import firebase from 'react-native-firebase'
import moment from 'moment';
import FastImage from 'react-native-fast-image'


const {width} = Dimensions.get('window')

export default class Feed extends Component {
  scrollX = new Animated.Value(0)

  constructor(props) {
    super(props)
    console.log(props)
    this.state = {
      post_id: this.props.post_id,
      username: this.props.username,
      image_url: this.props.image_url,
      time: this.showRelativeTime(this.props.timestamp),
      uri: this.props.urls,
      caption: this.props.caption,
      tags: this.props.tags,
      comments: this.props.comments,
      like: this.props.like_count,
      liked: this.props.liked,
      tag: this.props.tag, // this post is from tag followed
      follow: this.props.follow, // this post is from user followed
      username_user: "",
      color: '#6895fa',
      isVisible: false,
      edit: false,
      other: this.props.other,
    }
  }

  showRelativeTime = (timestamp) => {
    const myDate = new Date(timestamp._seconds*1000);
    return moment(myDate).fromNow()
  }

  setData = (result) => {
    const data = result.data
    this.setState({
      username_user: data.username,
    })
  }

  componentDidMount() {
    let getInfo = firebase.functions().httpsCallable('getInfo');
    let data = {
      fields: ['username']
    }
    getInfo(data).then(this.setData).catch(error => alert(error))
  }

  likePost = () => {
    if (!this.state.liked) {
      let like = firebase.functions().httpsCallable('addLike')
      like({post_id: this.state.post_id})
      .then(() => this.setState({liked: true, like: this.state.like + 1}))
      .catch((err) => console.log(err))
    } else {
      let unlike = firebase.functions().httpsCallable('deleteLike')
      unlike({post_id: this.state.post_id})
      .then(() => this.setState({liked: false, like: this.state.like - 1}))
      .catch((err) => console.log(err))
    }
  }

  addComment = () => {
    let addcomment = firebase.functions().httpsCallable('addComment')
    addcomment({
      username: this.state.username_user, 
      post_id: this.state.post_id,
      comment: this.state.comment
    }).then((result) => {
      let comments = this.state.comments
      comments.push(result.data.comment)
      console.log(comments)
      this.setState({comments: comments, isVisible: false})
    }).catch((err) => console.log(err))
  }

  changeCaption = () => {
    this.setState({edit: false})
    let change = firebase.functions().httpsCallable('changeCaption')
    change({
      post_id: this.state.post_id,
      caption: this.state.caption
    }).then((result) => {
      console.log(result.data)
    }).catch((err) => console.log(err))
  }

  render() {
    let position = Animated.divide(this.scrollX, width);
    
    return (
        <Card>
        <Overlay
        isVisible={this.state.isVisible}
        onBackdropPress={() => this.setState({ isVisible: false })}
        windowBackgroundColor="rgba(0, 0, 0, .5)"
        overlayBackgroundColor="white"
        overlayStyle={styles.overlayStyle}
        width={width}
        height="auto"
        >
        <SafeAreaView>
         <Item rounded style={styles.inputItem}>
          <Input 
            placeholder="Add a comment..."
            autoFocus={true}
            onChangeText={(comment) => {
              this.setState({comment})
              if (comment != "") {
                this.setState({postEnabled: true})
              } 
              else{
                this.setState({postEnabled: false})
              }
            }} 
            style={styles.input} multiline={true}/>
          {this.state.postEnabled && 
            <Button transparent onPress={() => this.addComment()}><Text style={styles.postBtn}>Post</Text></Button>
          }
          {!this.state.postEnabled && 
            <Button transparent disabled><Text style={styles.postBtnDisabled}>Post</Text></Button>
          }
        </Item>
        </SafeAreaView>
      </Overlay>
      <Overlay
        isVisible={this.state.edit}
        onBackdropPress={() => this.setState({ edit: false })}
        windowBackgroundColor="rgba(0, 0, 0, .5)"
        overlayBackgroundColor="white"
        overlayStyle={styles.overlayStyle}
        width={width}
        height="auto"
      >
      <SafeAreaView>
        <Item rounded style={styles.inputItem}>
          <Input 
            placeholder="Change caption..."
            autoFocus={true}
            onChangeText={(caption) => {
              this.setState({caption})
              if (caption != "") {
                this.setState({postEnabled: true})
              } 
              else{
                this.setState({postEnabled: false})
              }
            }} 
            style={styles.input} multiline={true}/>
            {this.state.postEnabled && 
              <Button transparent onPress={() => this.changeCaption()}><Text style={styles.postBtn}>Save</Text></Button>
            }
            {!this.state.postEnabled && 
              <Button transparent disabled><Text style={styles.postBtnDisabled}>Save</Text></Button>
            }
        </Item>
      </SafeAreaView>
      </Overlay>
        <CardItem>
          <Left>
            {(this.state.image_url && this.state.image_url != "" && this.state.follow) || (!this.state.follow && !this.state.tag)? 
              <FastImage 
              source={{
                uri: this.state.image_url,
                priority: FastImage.priority.normal}}
                style={styles.thumbnail}
              /> :
              <Thumbnail small source={require('../images/JShine.jpg')}/>
            }
            <TouchableWithoutFeedback 
            onPress={()=> {
              if (this.state.tag && !this.state.follow) {
                Actions.tagprofile({tag: this.state.tag})
              } else {
                Actions.otherprofile({username: this.state.username})
              }
            }
            }>
            <Body>
              <Text style={styles.bold}>{(this.state.tag && !this.state.follow) ? this.state.tag : this.state.username}</Text>
              <Text style={styles.postTime}>{this.state.time}</Text>
            </Body>
            </TouchableWithoutFeedback>
          </Left>
          {!this.state.other && 
          <Button transparent onPress={() => this.setState({ edit: true })}>
            <Icon name='edit' size={24}></Icon>
          </Button>}
        </CardItem>
        <CardItem cardBody>
          <ScrollView style={styles.wrapper} 
          horizontal={true} 
          pagingEnabled={true}
          snapToInterval={width}
          decelerationRate={0}
          showsHorizontalScrollIndicator={false}
          onScroll={
            Animated.event(
            [{ nativeEvent: { contentOffset: { x: this.scrollX } } }]
          )}
          scrollEventThrottle={16}
          >
          {this.state.uri.map((item, index) => {
            return (      
            <FastImage 
              source={{
                uri: item,
                priority: FastImage.priority.normal
              }} 
              key={item}
              style={{height: width, width: width, flex: 1}}/>)
          })
          }
          </ScrollView>
        </CardItem>
        <CardItem style={{height: 45}}>
          <Left style={{flex: 1}}>
            <Button transparent onPress={() => this.likePost()}>
              {this.state.liked && <Icon name = 'heart' size={20} color='#e95950'/>}
              {!this.state.liked && <Icon name = 'heart-o' size={20}/>}
            </Button>
            <Button transparent onPress={() => {this.setState({isVisible: true})}}>
              <Icon name = 'comment-o' size={20}/>
            </Button>
          </Left>
          {this.props.urls.length > 1 && 
          <View
            style={{ flexDirection: 'row' , flex: 1, justifyContent: 'center'}}
          >
            {this.props.urls.map((_, i) => {
              let opacity = position.interpolate({
                inputRange: [i - 1, i, i + 1], // each dot will need to have an opacity of 1 when position is equal to their index (i)
                outputRange: [0.3, 1, 0.3], // when position is not i, the opacity of the dot will animate to 0.3
                extrapolate: 'clamp' // this will prevent the opacity of the dots from going outside of the outputRange (i.e. opacity will not be less than 0.3)
              });
              return (
                <Animated.View
                  key={i}
                  style={{ opacity, height: 10, width: 10, backgroundColor: '#595959', margin: 8, borderRadius: 5 }}
                />
              );
            })}
          </View>}
          <Right style={{flex: 1}}>
          </Right>

        </CardItem>
        {this.state.like > 0 && <CardItem>
          <View><Text>{this.state.like} likes</Text></View>
        </CardItem>}
        <CardItem>
          <Body>
            <Text><Text style={styles.bold}>{this.state.username}</Text><Text>  </Text>{this.state.caption}</Text>
            <View  style={styles.container}>
            {this.state.tags.map((item, index) => {
             return ( 
             <View style={styles.tag} key={'D' + index.toString()}>
                <TouchableWithoutFeedback
                onPress={() => Actions.tagprofile({tag: item})}>
                  <Text style={{color: this.state.color}}>{item}</Text>
                </TouchableWithoutFeedback>
                <Text> </Text>
              </View>
            )})}
            </View>
          </Body>
        </CardItem>
        <CardItem>
          <FlatList
            data={this.state.comments}
            extraData={this.state}
            renderItem={({item}) =>
            <Left style={{height: 20, flex: 1}}>
              <View style={styles.comment}>
                <View>
                  <Text><Text style={styles.bold}>{item.username+" "}</Text>{item.content}</Text>
                </View>
                <View style={{ marginLeft: 'auto'}}>
                  <Text style={styles.time}>{this.showRelativeTime(item.timestamp)}</Text>
                </View>
              </View>
            </Left>
            }
            keyExtractor={item => item.timestamp._seconds.toString()}
          />
        </CardItem>
      </Card>
    )
  }
}

const styles = StyleSheet.create({
  thumbnail: {
    width: 40, 
    height: 40, 
    borderRadius: 40/2
  },
  inputItem: {
    paddingHorizontal: 10, 
    paddingRight: 20, 
    marginLeft: 10, 
    marginRight: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  time: {
    fontSize: 12, 
    color: 'grey',
  },
  comment: {
    height: 30,
    width: '100%',
    flexDirection: 'row', 
    justifyContent: 'center'
  },
  postTime: {
    fontSize: 12, 
    color: 'grey'
  },
  input: {
    fontSize: 15, 
    padding: 10
  },
  postBtn: {
    color: '#007AFF'
  },
  postBtnDisabled: {
    color: '#7285A5'
  },
  bold: {
    fontWeight: 'bold'
  },
  overlayStyle: {
    position: 'absolute',
    top: 0
  },
  container: {
    flexDirection: 'row', 
    flexWrap: 'wrap'
  },
  tag: {
    flexDirection: 'row', 
  },
  wrapper: {
    height: width,
    width: width,
    flex: 1
  }
})