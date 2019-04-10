import React from 'react'
import {View, Text, StyleSheet} from 'react-native'
import {Container, Header, Left, Button, Icon, Body, Right} from 'native-base'
import { GiftedChat } from 'react-native-gifted-chat'
import { isIphoneX } from '../utils/is-iphone-x'
import { Actions } from 'react-native-router-flux';
import firebase from 'react-native-firebase';
import FastImage from 'react-native-fast-image';
const notifications = firebase.notifications();

export default class ChatScreen extends React.Component {
	constructor(props) {
		super(props)
		console.log(props)

		this.state = {
			messages: [],
			username: this.props.username,
			receiver: this.props.uid,
			image_url: this.props.image_url ? this.props.image_url : require('../images/JShine.jpg'),
		}

	}

  componentWillMount() {
		// get message from database
		this.getMessage()
	}

	getMessage = () => {
		let chatroomId = ''
		const uid = firebase.auth().currentUser.uid
	
		if (uid > this.state.receiver) {
			chatroomId = uid + this.state.receiver;
		} else {
			chatroomId = this.state.receiver + uid;
		}
		firebase.firestore().collection('chatrooms/' + chatroomId + '/messages')
		.orderBy('timestamp','desc')
		.onSnapshot((snapshot) => {
			let messages = []
			snapshot.docChanges.forEach( (change) => {
				if (change.type === "added") {
					let doc = change.doc
					let temp = {}
					temp._id = doc.id
					temp.text = doc.data().text
					temp.createdAt = new Date(doc.data().timestamp)
					let user = {}
					user._id = doc.data().sender
					if (user._id != firebase.auth().currentUser.uid) {
						user.avatar = this.state.image_url
					}

					temp.user = user
					messages.push(temp)
				}
				console.log('updating')
			})
			this.setState(previousState => ({
				messages: GiftedChat.append(previousState.messages, messages),
			}))
		
		}, (err) => {
			console.log(err)
		});
	}
	

  onSend(messages = []) {
		const data = messages[0]
		console.log(data)
		data.receiver_uid = this.state.receiver
		// add message to database
		const send = firebase.functions().httpsCallable('sendMessage');
		send(data)
		.then(() => console.log('finished sending'))
		.catch((err) => console.log(err));
	}

  render() {
    return (
    <Container>
    <Header>
        <Left>
            <Button transparent style={{marginLeft: 10}} onPress={() => Actions.pop()}>
                <Icon name='arrow-back' style={{color: 'black'}}></Icon>
            </Button>
        </Left>
        <Body style={styles.flexRow}>
					<FastImage style={styles.thumbnail} source={{uri: this.state.image_url}}></FastImage>
          <Text>{this.state.username}</Text>
        </Body>
        <Right></Right>
    </Header>
			<GiftedChat 
				isLoadingEarlier={true}
				showAvatarForEveryMessage={true}
				bottomOffset={isIphoneX()? 36: 0}
				placeholder='Message...'
				isAnimated={true}
        messages={this.state.messages}
        onSend={messages => this.onSend(messages)}
        user={{
          _id: firebase.auth().currentUser.uid,
        }}
      />
      {isIphoneX() &&
      <View style={{ height: 36 }} />}
    </Container>
    )
  }
}

const styles = StyleSheet.create({
  thumbnail: {
    width: 30, 
    height: 30, 
		borderRadius: 30/2,
		marginHorizontal: '10%',
	},  
	flexRow: {
		flexDirection: 'row',
		justifyContent: 'center'
	}
});