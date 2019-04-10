import React, { Component } from 'react';
import { View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'

import {Actions} from 'react-native-router-flux';
import BottomNavigation, {
  IconTab
} from 'react-native-material-bottom-navigation'

import Profile from '../components/displayProfile'
import Search from '../components/search'
import LikeTab from '../components/likeTab'
import HomeTab from '../components/homeTab'

export default class Home extends Component {
    constructor(props) {
        super(props)
        console.log("HEY" + this.props.email)
        this.state = { activeTab: this.props.tab }
    }

    tabs = [
    {
      key: 'home',
      icon: 'home',
      label: 'home',
      barColor: '#8a3ab9',
      pressColor: 'rgba(255, 255, 255, 0.16)'
    },
    {
      key: 'search',
      icon: 'search',
      label: 'search',
      barColor: '#e95950',
      pressColor: 'rgba(255, 255, 255, 0.16)'
    },
    {
      key: 'add',
      icon: 'plus-square',
      label: 'add',
      pressColor: 'rgba(255, 255, 255, 0.16)'
    },
    {
      key: 'heart',
      icon: 'heart',
      label: 'heart',
      barColor: '#fccc63',
      pressColor: 'rgba(255, 255, 255, 0.16)'
    },
    {
      key: 'person',
      icon: 'user',
      label: 'person',
      barColor: '#4c68d7',
      pressColor: 'rgba(255, 255, 255, 0.16)'
    }

  ]

  renderIcon = icon => ({ isActive }) => (
      <Icon size={24} color="white" name={icon} />
  )

  renderTab = ({ tab, isActive }) => (
    <IconTab
      isActive={isActive}
      key={tab.key}
      label={tab.label}
      renderIcon={this.renderIcon(tab.icon)}
    />
  )

  displayScreen = () => {
    console.log(this.state.activeTab)
    switch (this.state.activeTab){
      case 'home':
        return <HomeTab />
      case 'person':
        return <Profile />
      case 'search':
        return <Search />
      case 'heart':
        return <LikeTab />
    }
  }

  handleTabPress = (newTab, oldTab) => {
    this.setState({ activeTab: newTab.key })
    if (newTab.key == "add") {
      this.setState({ activeTab: oldTab.key })
      Actions.image()
    }
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>

        {this.displayScreen()}

        </View>
        <BottomNavigation
          onTabPress={this.handleTabPress}
          renderTab={this.renderTab}
          tabs={this.tabs}
        />
      </View>
    )
  }
}
