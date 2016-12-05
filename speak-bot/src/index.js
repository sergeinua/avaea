import React, { Component } from 'react';
import { AppRegistry, Image, StyleSheet, Text, TextInput, View, ScrollView } from 'react-native'
import $ from "jquery";

// Components
const Card = ({ children }) => <View style={styles.card}>{children}</View>
const Title = ({ children }) => <Text style={styles.title}>{children}</Text>
const Photo = ({ uri }) => <Image source={{ uri }} style={styles.image} />
const Spacer = ({ height, width }) => <View style={{height: height, width: width}} />
const Flexer = () => <View style={{flex: 1}} />

const Bubble = ({ text }) => <View style={styles.bubbleContainer}>
    <Text style={styles.bubbleText}>{text}</Text>
</View>

const LeftBuble = ({ text }) => <View style={{paddingRight: 142}}><Bubble text="Hello!"/></View>
const RightBuble = ({ text }) => <View style={{paddingLeft: 142}}><Bubble text="Hello!"/></View>

const sessionId = "my-session-id-" + Math.random();

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {bubbles: []};
    }
    componentDidMount(){
        this.addBubble("bot", "Hello! How can I help you?");
        /* this.addBubble("user", "Hello!");*/
    }
    scrollToBottom(animated = true) {
        const scrollHeight = this.contentHeight - this.scrollViewHeight;
        if (scrollHeight > 0) {
            const scrollResponder = this.scrollView.getScrollResponder();
            /* scrollResponder.scrollResponderScrollTo({x: 0, scrollHeight, animated});*/
            scrollResponder.scrollResponderScrollTo({x: 0, y: scrollHeight, animated});
        }
    }

    addBubble(type, text){
        this.setState({bubles: this.state.bubbles.push({type: type, text: text})});
        setTimeout(() => this.scrollToBottom(), 500);
    }
    speak(msg){

        /*
         *         $.ajax({
         *             type: 'get',
         *             url : videoUrlFromAnotherDomain,
         *             crossDomain: 'true',
         *             success: function(data) {
         *                 // get a base64 version of the video!
         *                 var base64 = window.btoa(data);
         *                 // get a new url!
         *                 var newURL = 'data:video/mp4' + ';base64,' + base64;
         *                 // set the src on the video source element to the new url
         *                 video.find("source").attr("src", newURL);
         *             }
         * */

        var url = "http://beta.diotts.com/en/speech?speaker=Sarah&pitch=100&speed=100&volume=100&content=" + encodeURIComponent(msg);
        var audio = document.getElementById('sampleAudio');
        audio.src = url;
        audio.play();
    }
    loadAnswer(text){
        var accessToken = "6bda191d269b486ca98d1292bf90a44b"
        var baseUrl = "https://api.api.ai/v1/";
        $.ajax({
            type: "POST",
            url: baseUrl + "query?v=20150910",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + accessToken
            },
            data: JSON.stringify({ q: text, lang: "en", sessionId: sessionId }),
            success: (data) => {
                var msg = JSON.stringify(data.result.fulfillment.speech, undefined, 2);
                msg = msg.replace(/^"|"$/g, "")
                this.addBubble("bot", msg);
                this.speak(msg);
                /* alert("success:" + msg)*/
            },
            error: (e) => {
                /* console.log(">>>> error:", e)*/
					      alert("Internal Server Error:" + e);
				    }
			  });
    }
    render() {
        var counter = 0;
        var bubblesList = this.state.bubbles.map((e) => {
            if(e.type == "user"){
                return (<View key={"bubble-" + counter++} style={{paddingLeft: 142}}><Bubble text={e.text}/></View>);
            }else{
                return (<View key={"bubble-" + counter++} style={{paddingRight: 142}}><Bubble text={e.text}/></View>);
            }
        });

        return (
            <View style={styles.root}>
                <Title>MERI</Title>
                <ScrollView ref={(scrollView) => this.scrollView = scrollView} style={styles.scrollView}
                           onContentSizeChange={(w, h) => this.contentHeight = h}
                           onLayout={ev => this.scrollViewHeight = ev.nativeEvent.layout.height} >
                    <View>{bubblesList}</View>
                </ScrollView>
                <TextInput ref={(input) => this.input = input}
                           placeholder="Input text here..."
                           placeholderTextColor="rgba(255,255,255,0.3)"
                           style={styles.input}
                           autoFocus={true}
                           clearButtonMode="always"
                           onSubmitEditing={(e) => {
                                   this.input.clear();
                                   var msg = e.nativeEvent.text;
                                   this.addBubble("user", msg);
                                   this.loadAnswer(msg);
                                   }}
                />
            </View>
        );
    }
}

// Styles
const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#ccc',
    },
    card: {
        flex: 1,
        backgroundColor: '#ccc',
        justifyContent: 'center'
    },
    title: {
        padding: 16,
        fontSize: '1.25rem',
        fontWeight: 'bold'
    },
    image: {
        height: 40,
        marginVertical: 10,
        width: 40
    },
    scrollView: {
        flex: 1,
        /* backgroundColor: "red",*/
    },
    bubbleContainer: {
        margin: 12,
        padding: 12,
        backgroundColor: "skyblue"
    },
    bubbleText: {
        fontSize: '1.25rem',
    },
    input: {
        backgroundColor: 'skyblue',
        fontSize: '1.25rem',
        padding: 18,
    }
})

// App registration and rendering
AppRegistry.registerComponent('MyApp', () => App)
AppRegistry.runApplication('MyApp', { rootTag: document.getElementById('root') })
