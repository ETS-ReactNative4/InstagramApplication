import React, { Component } from 'react';
import { View,FlatList,TouchableWithoutFeedback,Text,ActivityIndicator,StyleSheet,SafeAreaView } from 'react-native';
import firebase from 'react-native-firebase';
import { ListItem } from 'react-native-elements'
import { Container, Body, Thumbnail,Content,Header } from 'native-base'
import { Actions } from 'react-native-router-flux';
import moment from 'moment';
import FastImage from 'react-native-fast-image'

export default class LikeTab extends Component {

    constructor(props) {
        super(props)

        this.state = {
          list: [],
          loading: false
        };
    }

    componentDidMount() {
      this.getLikeList()
    }

    renderSeparator = () => {
      return (
        <View
          style={styles.renderSeparator}
        />
      );
    };

    showRelativeTime = (timestamp) => {
      const myDate = new Date(timestamp._seconds*1000);
      return moment(myDate).fromNow()
    }

    getLikeList = (search) => {
      this.setState({loading: true });
      let getLike = firebase.functions().httpsCallable('getLikes');
      getLike()
      .then((result) => {
        console.log('list created')
        console.log(result.data.list)
        this.setState({list: result.data.list, loading: false})
      })
      .catch(error => alert(error))
    };

    render() {
      return (
        <Container>
          <Header>
            <Body>
              <Text>You</Text>
            </Body>
          </Header>
        <Content>          
            {this.state.loading && 
            <View style={styles.indicator}>
            <ActivityIndicator animating/>
            </View> }
        
          {!this.state.loading &&
          <FlatList
          data={this.state.list}
          renderItem={({item}) =>
          <TouchableWithoutFeedback >
            <ListItem
              title={item.username + ' liked your post'}
              subtitle={this.showRelativeTime(item.timestamp)}
              subtitleStyle={styles.subtitle}
              color='black'
              leftIcon={item.image_url ?              
              <FastImage 
                source={{
                  uri: item.image_url,
                  priority: FastImage.priority.normal}}
                  style={styles.thumbnail}
                />:
                <Thumbnail small source={require('../images/JShine.jpg')}/>}
              rightIcon={{name: 'arrow-forward'}}
            />
          </TouchableWithoutFeedback>
          }
          ItemSeparatorComponent={this.renderSeparator}
          keyExtractor={(item, index) => index.toString()}/>
        }
        </Content>
        </Container>
      )
    }
}

const styles = StyleSheet.create({
  subtitle: {
    fontSize: 12, 
    color: 'grey'
  },
  indicator: {
    marginTop: '30%',
  },
  thumbnail: {
    width: 40, 
    height: 40, 
    borderRadius: 40/2
  },
  renderSeparator: {
    height: 1,
    width: "100%",
    backgroundColor: "#CED0CE",
  }
});