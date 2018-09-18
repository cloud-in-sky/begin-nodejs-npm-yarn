import React from 'react';
import { StyleSheet, Platform, Image, Text, View, TouchableOpacity } from 'react-native';
import firebase from 'react-native-firebase';

//import GetDBdoc from './GetDBdoc.js';

//import Wordwork4 from './Wordwork4.js';
//import HighLowScore from './HighLowScore.js';

import Wordwork5 from './Wordwork5.js';

export default class Main extends React.Component {
  state = { currentUser: null };

  componentDidMount() {
    const { currentUser } = firebase.auth();

    this.setState({ currentUser });
  }

  _userSignout = () => {
    this.setState({ currentUser: null });
    firebase.auth().signOut();
    this.props.navigation.navigate('Login');
  }

  render() {
    const { currentUser } = this.state;

    return (
      <View style={styles.container}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingBottom: 2 }}>
          <Text style={styles.itemText}> {currentUser && currentUser.email}! </Text>
          <TouchableOpacity style={styles.submitButtonStyle}
            onPress={() => this._userSignout()}>
            <Text style={styles.submitButtonTextStyle}> Signout </Text>
          </TouchableOpacity>
        </View>

        <Wordwork5 />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //justifyContent: 'center',
    //alignItems: 'center'
  },
  itemText: {
    fontSize: 14,
    paddingRight: 20,
  },
  submitButtonStyle: {
    backgroundColor: '#7a42f4',
    paddingLeft: 5,
    margin: 5,
    /* height: 40,*/
  },
  submitButtonTextStyle: {
    color: 'white'
  },
})
