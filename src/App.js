import React,{Component} from 'react';
import Navigation from './Components/Navigation/Navigation'
import Logo from './Components/Logo/Logo';
import ImageLinkForm from './Components/ImageLinkForm/ImageLinkForm'
import Rank from './Components/Rank/Rank';
import FaceRecognition from './Components/FaceRecognition/FaceRecognition';
import SignIn from './Components/SignIn/SignIn';
import Register from './Components/Register/Register';

import Particles from 'react-particles-js';
import './App.css';

const particlesOptions={
  particles: {
     number: {
      value:100,
      density: {
        enable:true,
        value_area:700
      },
      line_linked: {
      enable_auto : true
      }
    }
  },
  interactivity:{
    detect_on:"window",
   events:{
      onhover:{
        enable:true,
        mode: "repulse"
      },
      onclick:{
        enable:true,
        mode: "push"
      }
    }
  }
}

const initalState = {
    input:'',
      imageUrl:'',
      box:[] ,
      route:'signin',
      isSignedIn:false ,
      user:{
        id:'',
        name: '',
        email: '',
        entries: 0,
        joined: ''
}
}

class App extends Component {
  constructor(){
    super();
    this.state = {
      input:'',
      imageUrl:'',
      box:[] ,
      route:'signin',
      isSignedIn:false ,
      user:{
        id:'',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }    
    }
  }

  loadUser = (data) =>{
    this.setState({user:{
        id:data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
    }})
  }

// use for inital setup check
//   componentDidMount(){
//     fetch('http://localhost:3000')
//       .then(resonse => resonse.json())
//       .then(console.log)
//   }

  calculateFaceLocation = (data) =>{
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);

    const coordinates = [];

    data.outputs.forEach(output => {
      return output.data.regions.forEach(regions => {
        const clarifaiFace = regions.region_info.bounding_box;
        //console.log(regions);
        coordinates.push({
        id:regions.id,  
        leftCol: clarifaiFace.left_col * width,
        topRow: clarifaiFace.top_row * height,
        rightCol: width - (clarifaiFace.right_col * width),
        bottomRow: height - (clarifaiFace.bottom_row * height)
        })
      }) 
    })
    return coordinates;
  }

  displayFaceBox = (box) => {
    //console.log(box);
    this.setState({box : box});
  }

  onInputChange=(event) =>{
    this.setState({input : event.target.value});
  }

  onPictureSubmit = () =>{
    this.setState({imageUrl: this.state.input});
    fetch('https://young-springs-40794.herokuapp.com/imageurl',{
      method:'post',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        input: this.state.input
      })
    })
    .then(response => response.json())
    .then(response =>{
      if(response){
        //fetch('http://localhost:3000/image',{
          fetch('https://young-springs-40794.herokuapp.com/image',{
          method:'put',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({
            id: this.state.user.id
          })
        })
        .then(response => response.json())
        .then(count =>{
          this.setState(Object.assign(this.state.user, { entries:count}))
        })
        .catch(console.log)
      }
      this.displayFaceBox(this.calculateFaceLocation(response)) 
    })
    .catch(err => console.log(err));
  }
  
  onRouteChange = (route) =>{
    if(route === 'signout')
    {
      this.setState(initalState);
    }else if(route === 'home'){
      this.setState({isSignedIn:true});     
    }
    this.setState({route : route});
    //console.log(route , this.state.isSignedIn);
  }

  render(){
    const {isSignedIn, imageUrl, route, box } = this.state;
    return (
      <div className="App">
        <Particles className='particles'
          params={particlesOptions} 
        />
        <Navigation onRouteChange={this.onRouteChange} isSignedIn={isSignedIn}/>
        { route === 'home' 
          ? <div>
              <Logo/>
              <Rank name={this.state.user.name} entries={this.state.user.entries}/>
              <ImageLinkForm onInputChange={this.onInputChange} onPictureSubmit={this.onPictureSubmit}/>
              <FaceRecognition box={box} imageUrl={imageUrl}/>
            </div>
          : ( route === 'signin'|| route === 'signout'
              ? <SignIn onRouteChange={this.onRouteChange}loadUser={this.loadUser}/>
              : <Register onRouteChange={this.onRouteChange} loadUser={this.loadUser}/>
          )
           
        }
      </div> 
    );
  } 
}

export default App;
