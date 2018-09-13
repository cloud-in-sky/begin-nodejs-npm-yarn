import React, { Component } from "react";
import { StyleSheet, FlatList, Text, View, TouchableOpacity, TextInput, Button, Dimensions, Keyboard, ScrollView, Alert, ActivityIndicator, } from "react-native";

import firebase from 'react-native-firebase';
import Swiper from 'react-native-swiper';

var screenwidth = Dimensions.get('window').width;

export default class Wordwork4 extends Component {
    constructor(props) {
        super(props);

        this.ref = firebase.firestore().collection('wordmatch');
        this.unsubscribe = null;

        this.state = {
            aletter: 'A',
            bletter: 'B',
            cletter: 'C',
            dletter: 'D',
            eletter: 'E',
            isLoading: false,
            dataItems: [],
            hintItems: [],
            relatedItems: [],
            partword: '',
            spellCorrect: false,
            nowscore: 0,
            email: '',
            scores: [],
            currentUser: null,
            userExist: false,
            docid: '',
        };

    }

    componentDidMount() {
        // Connect to firebase
        this.unsubscribe = this.ref.onSnapshot(this.onCollectionUpdate)

        const { currentUser } = firebase.auth();
        this.setState({ currentUser });
        // find user existing score
        var uemail = currentUser.email;
        this._findemailscore(uemail);

        //this.setState({ isLoading: false });
        // Generate new letters
        this._newLetters();
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

    _findemailscore = (xemail) => {
        var xscore = 0;
        var userexisting = false;
        var nowdocid = '';
        this.ref.get().then(snapshot => {
            snapshot.docs.forEach(doc => {
                const { email, score } = doc.data();
                if (email.localeCompare(xemail) == 0) {
                    userexisting = true;
                    nowdocid = doc.id;

                    if (score >= xscore) {
                        xscore = score;
                    }
                }
            });

            this.setState({
                userExist: userexisting,
                nowscore: xscore,
                docid: nowdocid,
                isLoading: false,
            });

        });

    }

    _randomString = () => {
        var chars = "ABCDEFGHIJKLMNOPQRSTUVWXTZ";
        var string_length = 1;
        var randomstr = '';
        for (var i = 0; i < string_length; i++) {
            var rnum = Math.floor(Math.random() * chars.length);
            randomstr += chars.substring(rnum, rnum + 1);
        }
        return randomstr;
    }

    _aLetterPress = () => {
        var newLetter = this._randomString();
        this.setState({ aletter: newLetter });
    };

    _bLetterPress = () => {
        var newLetter = this._randomString();
        this.setState({ bletter: newLetter });
    };

    _cLetterPress = () => {
        var newLetter = this._randomString();
        this.setState({ cletter: newLetter });
    };

    _dLetterPress = () => {
        var newLetter = this._randomString();
        this.setState({ dletter: newLetter });
    };

    _eLetterPress = () => {
        var newLetter = this._randomString();
        this.setState({ eletter: newLetter });
    };

    _add1aLetterPress = () => {
        var partwd = this.state.partword + this.state.aletter;
        this.setState({ partword: partwd });
    };

    _add1bLetterPress = () => {
        var partwd = this.state.partword + this.state.bletter;
        this.setState({ partword: partwd });
    };

    _add1cLetterPress = () => {
        var partwd = this.state.partword + this.state.cletter;
        this.setState({ partword: partwd });
    };

    _add1dLetterPress = () => {
        var partwd = this.state.partword + this.state.dletter;
        this.setState({ partword: partwd });
    };

    _add1eLetterPress = () => {
        var partwd = this.state.partword + this.state.eletter;
        this.setState({ partword: partwd });
    };


    _hideSoftKeyboard = () => {
        Keyboard.dismiss();
    }

    _inputChange() {
        this.setState({ isLoading: false });
        this._hideSoftKeyboard();
        this.textInput.clear();
        this._fetchMeaningData(this.state.partword);
        this._fetchHintData(this.state.partword);
        this._fetchRelatedData(this.state.partword);
    }

    _clearInput = () => {
        this.textInput.clear();
        this.setState({
            partword: '',
            dataItems: [],
            hintItems: [],
            relatedItems: [],
            spellCorrect: false,
        });
    };

    _resetInput = () => {
        this._clearInput();
        this._newLetters();
    };

    _newLetters = () => {
        this._aLetterPress();
        this._bLetterPress();
        this._cLetterPress();
        this._dLetterPress();
        this._eLetterPress();
    }


    _fetchMeaningData(myword) {
        //Retrieve remote JSON data
        var jUrl = 'https://api.datamuse.com/words?sp=';
        if (myword) {
            jUrl = jUrl + myword + '&md=d';

            return fetch(jUrl, { cache: "no-cache" })
                .then((response) => response.json())
                .then((responseJson) => {
                    this.setState({
                        //isLoading: false,
                        dataItems: responseJson,
                    }, function () {
                        // In this block you can do something with new state.
                    });

                    var jstr = JSON.stringify(responseJson);
                    //var xxx = JSON.parse(jstr);

                    //Check if 'defs' key: spelling correct
                    if (jstr.indexOf("defs") > 0) {
                        var xscore = this.state.nowscore + 10;
                        // Add or update score to firebase
                        const { currentUser } = this.state;
                        var nowid = this.state.docid;
                        if (nowid.length < 1) {
                            nowid = this.state.currentUser.email;
                        }

                        if (this.state.userExist) {
                            this.ref.doc(nowid).set({
                                email: this.state.currentUser.email,
                                score: xscore,
                            });
                        } else {
                            this.ref.add({
                                email: this.state.currentUser.email,
                                score: xscore,
                            });

                            this.setState({
                                userExist: true,
                                docid: nowid,
                            });
                        }

                        this.setState({
                            spellCorrect: true,
                            nowscore: xscore,
                        });
                    } else {
                        this.setState({
                            spellCorrect: false,
                            //score: 99,
                        });
                    }

                })
                .catch((error) => {
                    console.error(error);
                });

        }
    }

    _fetchHintData(myword) {
        //Retrieve remote JSON data
        var jUrl = 'https://api.datamuse.com/words?sp=';
        if (myword) {
            jUrl = jUrl + myword + '*&md=d&max=10';
            var respJ = [];

            return fetch(jUrl)
                .then((response) => response.json())
                .then((responseJson) => {
                    for (xx in responseJson) {
                        var qq = "";
                        if (responseJson[xx].hasOwnProperty('defs')) {
                            var pp = responseJson[xx].defs;
                            qq = responseJson[xx].word + '\n' + pp[0].replace("\t", ". ");
                        } else {
                            qq = responseJson[xx].word
                        };
                        respJ.push(qq);
                    };

                    this.setState({
                        isLoading: false,
                        hintItems: respJ
                    }, function () {
                        // In this block you can do something with new state.
                    });
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    }

    _fetchRelatedData(myword) {
        //Retrieve remote JSON data
        var jUrl = 'https://api.datamuse.com/words?ml=';
        if (myword) {
            jUrl = jUrl + myword + '&md=d&max=10';
            var respJ = [];

            return fetch(jUrl)
                .then((response) => response.json())
                .then((responseJson) => {
                    for (xx in responseJson) {
                        var qq = "";
                        if (responseJson[xx].hasOwnProperty('defs')) {
                            var pp = responseJson[xx].defs;
                            qq = responseJson[xx].word + '\n' + pp[0].replace("\t", ". ");
                        } else {
                            qq = responseJson[xx].word
                        };
                        respJ.push(qq);
                    };

                    this.setState({
                        isLoading: false,
                        relatedItems: respJ
                    }, function () {
                        // In this block you can do something with new state.
                    });
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    }

    _flItemSeparator = () => {
        return (
            <View style={{ height: 2, width: "100%", backgroundColor: "skyblue" }} />
        );
    }

    _keyExtractor = (item, index) => String(index);

    _renderItem = ({ item, index }) => {
        return (
            <TouchableOpacity activeOpacity={0.5} >
                <Text style={styles.itemStyle}>{item}</Text>
            </TouchableOpacity>
        );
    }

    _renderMeaningItem = ({ item, index }) => {
        // has key: 'defs', means spelling corrrect
        if (item.hasOwnProperty('defs')) {
            return (
                <ScrollView style={{ padding: 10 }}>
                    {
                        item.defs.map((itemx, index) => (
                            <View key={index}>
                                <Text style={{ fontSize: 24, padding: 3 }}>{itemx.replace("\t", ". ")}</Text>
                            </View>
                        ))
                    }
                </ScrollView>
            );
        } else {
            return (
                <TouchableOpacity activeOpacity={0.5}>
                    <Text style={styles.itemStyle}>Try again...</Text>
                </TouchableOpacity>
            );
        }
    }


    render() {

        if (this.state.isLoading) {
            return <ActivityIndicator size="large" />;
        }

        return (
            <View style={styles.containerStyle}>
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingBottom: 5 }}>
                    <View style={{ paddingRight: 7 }}>
                        <TouchableOpacity onLongPress={this._aLetterPress} onPress={this._add1aLetterPress} activeOpacity={0.8} style={styles.buttonStyle} >
                            <Text style={styles.buttontextStyle}>{this.state.aletter}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ paddingLeft: 7, paddingRight: 7 }}>
                        <TouchableOpacity onLongPress={this._bLetterPress} onPress={this._add1bLetterPress} activeOpacity={0.8} style={styles.buttonStyle} >
                            <Text style={styles.buttontextStyle}>{this.state.bletter}</Text>
                        </TouchableOpacity>
                    </View >
                    <View style={{ paddingLeft: 7, paddingRight: 7 }}>
                        <TouchableOpacity onLongPress={this._cLetterPress} onPress={this._add1cLetterPress} activeOpacity={0.8} style={styles.buttonStyle} >
                            <Text style={styles.buttontextStyle}>{this.state.cletter}</Text>
                        </TouchableOpacity>
                    </View >
                    <View style={{ paddingLeft: 7, paddingRight: 7 }}>
                        <TouchableOpacity onLongPress={this._dLetterPress} onPress={this._add1dLetterPress} activeOpacity={0.8} style={styles.buttonStyle} >
                            <Text style={styles.buttontextStyle}>{this.state.dletter}</Text>
                        </TouchableOpacity>
                    </View >
                    <View style={{ paddingLeft: 7 }}>
                        <TouchableOpacity onLongPress={this._eLetterPress} onPress={this._add1eLetterPress} activeOpacity={0.8} style={styles.buttonStyle} >
                            <Text style={styles.buttontextStyle}>{this.state.eletter}</Text>
                        </TouchableOpacity>
                    </View >
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingBottom: 5 }}>
                    <TextInput
                        style={styles.inputFieldStyle}
                        placeholder="Your word"
                        autoCorrect={false}
                        ref={input => { this.textInput = input }}
                        value={this.state.partword}
                        onChangeText={(text) => this.setState({ partword: text })}
                        editable={false}
                        selectTextOnFocus={false}
                    />
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingBottom: 10 }}>
                    <View style={{ paddingRight: 10 }}>
                        <Button title='Check' backgroundColor="#3b5998" onPress={this._inputChange.bind(this)} />
                    </View>
                    <View style={{ paddingLeft: 20, paddingRight: 20 }}>
                        <Button title='Reset' backgroundColor="#3b5998" onPress={this._resetInput.bind(this)} />
                    </View >
                    <View style={{ paddingLeft: 20, paddingRight: 20 }}>
                        <Button title='Clear' backgroundColor="#3b5998" onPress={this._clearInput.bind(this)} />
                    </View >
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingBottom: 10 }}>
                    <View style={{ paddingRight: 10 }}>
                        <Text style={{ fontSize: 20, color: '#0000cc' }}>{this.state.partword}</Text>
                    </View>
                    <View style={{ paddingLeft: 20, paddingRight: 20 }}>
                        <Text style={{ fontSize: 24, color: '#00cc00', fontWeight: 'bold' }}>{this.state.spellCorrect ? 'Correct!' : ''}</Text>
                    </View >
                    <View style={{ paddingLeft: 10 }}>
                        <Text style={{ fontSize: 20 }}>Score: {this.state.nowscore} </Text>
                    </View >
                </View>

                <Swiper style={styles.wrapper} height={380} showsButtons={true}>

                    <View >
                        <FlatList
                            data={this.state.dataItems}
                            ItemSeparatorComponent={this._flItemSeparator}
                            keyExtractor={this._keyExtractor}
                            renderItem={this._renderMeaningItem}
                        />
                    </View>

                    <View >
                        <FlatList
                            data={this.state.hintItems}
                            ItemSeparatorComponent={this._flItemSeparator}
                            keyExtractor={this._keyExtractor}
                            renderItem={this._renderItem}
                        />
                    </View>

                    <View >
                        <FlatList
                            data={this.state.relatedItems}
                            ItemSeparatorComponent={this._flItemSeparator}
                            keyExtractor={this._keyExtractor}
                            renderItem={this._renderItem}
                        />
                    </View>
                </Swiper>

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
