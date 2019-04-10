import React, { Component } from 'react';
import { View, FlatList, ActivityIndicator, Image, Dimensions} from 'react-native';
import firebase from 'react-native-firebase';
import FastImage from 'react-native-fast-image'

export default class PhotosTab extends Component {
    constructor(props) {
        super(props)

        this.state = {
            images: [],
            width: 0,
            height: 0,
            isLoading: false
        }

    }

    componentWillMount() {
      this.getPhotos()
    }

    setImages = (result) => {
      this.setState(
        {images: result.data.photos,
        width: Dimensions.get('window').width/3,
        height: Dimensions.get('window').width/3
      })
      console.log('success getting images')
      console.log(result.data.photos)
      this.setState({isLoading: false})
    }

    getPhotos = () => {
      console.log(this.props)
      this.setState({isLoading: true})
      let getPhotoList = firebase.functions().httpsCallable(this.props.name);
      getPhotoList({uid: this.props.uid}).then(this.setImages)
      .catch( (err) => {console.log(err)})
    }

    render() {
        return (
          <View>
            {this.state.isLoading ? <ActivityIndicator animating large style={{marginTop: '40%'}}/> :
            <FlatList
              data={this.state.images}
              renderItem={({item}) =>
              <FastImage 
                source={{
                  uri: item, 
                  priority: FastImage.priority.normal
                }} 
                style={{width: (this.state.width), height: (this.state.height)}}/>
              }
              numColumns={3}
              keyExtractor={item => item}
            />}
          </View>
        )
    }
}
