import React, { Component } from "react";
import { StyleSheet, Text, View, Dimensions, ActivityIndicator, } from "react-native";

import firebase from 'react-native-firebase';

var screenwidth = Dimensions.get('window').width;

export default class HighLowScore extends Component {
    constructor(props) {
        super(props);

        this.ref = firebase.firestore().collection('wordmatch');
        this.unsubscribe = null;

        this.state = {
            isLoading: false,
            nowscore: 0,
            email: '',
            scores: [],
            currentUser: null,
            highScore: 0,
            lowScore: 0,
        };

    }

    componentDidMount() {
        // Connect to firebase
        this.unsubscribe = this.ref.onSnapshot(this.onCollectionUpdate)

        const { currentUser } = firebase.auth();
        this.setState({ currentUser });
        // find user existing score        
        this._findHighLowScore();
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    onCollectionUpdate = (querySnapshot) => {
        const scores = [];
        querySnapshot.forEach((doc) => {
            const { email, score } = doc.data();
            scores.push({
                key: doc.id, // Document ID
                doc, // DocumentSnapshot
                email,
                score,
            });
        });
        this.setState({
            scores,
        });
    }

    _findHighLowScore = () => {
        var xhighScore = 0;
        var xlowScore = 10;
        this.ref.get().then(snapshot => {
            snapshot.docs.forEach(doc => {
                const { email, score } = doc.data();
                if (score > xhighScore) {
                    xhighScore = score;
                }

                if (score < xlowScore) {
                    xlowScore = score
                }
            });

            this.setState({
                highScore: xhighScore,
                lowScore: xlowScore,
                isLoading: false,
            });
        });
    }

    render() {

        if (this.state.isLoading) {
            return <ActivityIndicator size="large" />;
        }

        return (
            <View style={styles.containerStyle}>

                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingBottom: 10 }}>
                    <View style={{ paddingRight: 10 }}>
                        <Text style={{ fontSize: 20, color: '#0000cc' }}>Score:</Text>
                    </View>
                    <View style={{ paddingLeft: 10, paddingRight: 10 }}>
                        <Text style={{ fontSize: 20, color: '#ff0000' }}>Highest: {this.state.highScore}</Text>
                    </View >
                    <View style={{ paddingLeft: 10 }}>
                        <Text style={{ fontSize: 20, color: '#00cc00' }}>Lowest: {this.state.lowScore} </Text>
                    </View >
                </View>

            </View >
        );
    }
}


const styles = StyleSheet.create({
    containerStyle: {
        /* justifyContent: 'flex-start', */
        margin: 3,
    },
    buttonStyle: {
        padding: 10,
        backgroundColor: '#00BCD4',
        borderRadius: 3,
    },
    buttontextStyle: {
        color: '#fff',
        width: 30,
        fontSize: 24,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    itemStyle: {
        padding: 7,
        fontSize: 24,
        height: 100,
    },
    inputFieldStyle: {
        width: screenwidth * .7,
        fontSize: 20,
        margin: 2,
        height: 44,
        borderColor: '#7a42f4',
        borderWidth: 2,
    },
    wrapper: {
        width: screenwidth * 0.9,
    },
});
