import React, { Component } from 'react';
import { View,FlatList,TouchableWithoutFeedback,Text,ActivityIndicator,StyleSheet,SafeAreaView } from 'react-native';
import firebase from 'react-native-firebase';
import { SearchBar, ListItem } from 'react-native-elements'
import { Container, Button, Thumbnail,Content } from 'native-base'
import { Actions } from 'react-native-router-flux';
import FastImage from 'react-native-fast-image'

export default class Search extends Component {

    constructor(props) {
        super(props)

        this.state = {
          search: '',
          list: [],
          tagList: [],
          loading: false,
          selected: 1
        };
    }

    renderSeparator = () => {
      return (
        <View
          style={styles.renderSeparator}
        />
      );
    };

    cleanSearch = (search) => {
      let temp = search.split('#')
      temp = temp.join('')
      return temp
    }

    updateSearch = (search) => {
      this.setState({ search: search});

      if (this.state.selected == 1) {
        if (search.length >= 1) {
          this.setState({loading: true });
          let searchUsername = firebase.functions().httpsCallable('usernameSearch');
          searchUsername({search: search})
          .then((result) => {
            console.log('list created')
            console.log(result.data.usernames)
            this.setState({list: result.data.usernames, loading: false})
          })
          .catch(error => alert(error))
        }
      } else {
        if (this.cleanSearch(search).length >= 1) {
          console.log(search)
          this.setState({loading: true });
          search  = this.cleanSearch(search)
          let searchTag = firebase.functions().httpsCallable('tagSearch');
          searchTag({search: '#'+search})
          .then((result) => {
            console.log('list created')
            console.log(result.data.tags)
            this.setState({tagList: result.data.tags, loading: false})
          })
          .catch(error => alert(error))
        }
      }

    };

    render() {
      const { search } = this.state;

      return (
        <Container>
          <SafeAreaView>
        <SearchBar
          placeholder='Search'
          lightTheme
          platform='ios'
          autoCapitalize = "none"
          onChangeText={this.updateSearch}
          containerStyle={{backgroundColor: 'transparent'}}
          value={search}
        />
        </SafeAreaView>
        <Content>
        <View style={styles.container}>
          <View style = {{flex: 1, borderWidth: 1, borderColor: 'transparent',             
          borderBottomColor: this.state.selected == 1 ? "black" : undefined
          }}>
            <Button block
              active={this.state.selected == 1} 
              onPress={() => {
                this.setState({ selected: 1, search: '' })
              }}
              style={styles.button}>
              <Text style={{color: this.state.selected == 1 ? "black" : 'grey'}}>People</Text>
            </Button>
            </View>
            <View style = {{flex: 1, borderWidth: 1, borderColor: 'transparent',         
            borderBottomColor: this.state.selected == 2 ? "black" : undefined
            }}>
            <Button block
              active={this.state.selected == 2} 
              onPress={() => {
                this.setState({ selected: 2, search: '' })
              }}
              style={styles.button}>
              <Text style={{color: this.state.selected == 2 ? "black" : 'grey'}}>Tags</Text>
            </Button>
            </View>
        </View>
            {this.state.loading && 
            <View style={{flexDirection: 'row', justifyContent: 'center',marginTop: 20}}>
            <Text>Searching  </Text>
            <ActivityIndicator/>
            </View> }
        {this.state.selected == 1 && !this.state.loading &&
        <FlatList
          data={this.state.list}
          renderItem={({item}) =>
          <TouchableWithoutFeedback 
          onPress={() => Actions.otherprofile({username: item.username})}>
            <ListItem
              title={item.username}
              subtitle={item.fullName}
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
          keyboardShouldPersistTaps='handled'
          keyExtractor={(item, index) => index.toString()}/>}
          {this.state.selected == 2 && !this.state.loading &&
          <FlatList
          data={Object.keys(this.state.tagList)}
          renderItem={({item}) =>
          <TouchableWithoutFeedback onPress={()=> Actions.tagprofile({tag: item, post: this.state.tagList[item]})}>
            <ListItem
              title={item}
              subtitle={this.state.tagList[item] + ' posts'}
              subtitleStyle={{fontSize: 12, color: 'grey'}}
              color='black'
              rightIcon={{name: 'arrow-forward'}}
            />
          </TouchableWithoutFeedback>
          }
          ItemSeparatorComponent={this.renderSeparator}
          keyboardShouldPersistTaps='handled'
          keyExtractor={(item, index) => index.toString()}/>
        }
        </Content>
        </Container>
      )
    }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
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
  },
  button: {
    backgroundColor: 'white'
  }
});