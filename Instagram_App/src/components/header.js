import React, { Component } from 'react'
import { Text, View } from 'react-native'
import {Fonts} from '../utils/Fonts'



const Header = () => {
    const { viewStyle, companyTitle } = styles;

    return (
        <View style={viewStyle}>
            <Text style={companyTitle}>
                Original Finsta
            </Text>
        </View>
    )
}

const styles = {
    companyTitle:{
        fontSize: 40,
        color: 'white',
        marginTop: 20
        //fontFamily: Fonts.Snow
    },
    viewStyle: {
        marginTop: 50,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        elevation: 2,
        position: 'relative'
    }
}

export default Header;
