import { useState, useEffect } from 'react';

export default function Home() {

    const [data, setData] = useState(null);

    const apiURL = '/api/'; //allow cors - cross origin resource sharing
    //the effect{theFunction}, and when to run it[array] - on change for example
    useEffect(() => {
        fetch(`${apiURL}/data`) //fetch from backend server - TESTING
            .then((res) => res.json()) //parse json response
            .then((dataFromServer) => setData(dataFromServer)) //set state with data from server
            .then(() => console.log("Data fetched successfully"))

    }, []);    
    return (
        //display message from server or use Loading... if data null
        <div>
        <h1>Welcome to the Home Page</h1>
        <p>This is a sample home page for the application Made by Developer.</p>
        <p>{data ? data.message:'Loading...'}</p> 
        </div>
    );

}
