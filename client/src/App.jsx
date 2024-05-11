import axios from "axios";
import React, { useEffect, useState } from "react";

const App = () => {
  const [jokes, setJokes] = useState([]);

  useEffect(() => {
    axios
      .get("/api/joke")
      .then((response) => setJokes(response.data.data))
      .catch((error) => console.error("Error fetching jokes:", error));
  }, []); // Empty dependency array to ensure useEffect only runs once

  return (
    <div>
      <h1>{jokes.length}</h1> {/* Use length property to get the count */}
      {jokes.length !== 0 &&
        jokes.map((joke, index) => (
          <div key={index}>
            <h2>{joke.title}</h2>
            <p>{joke.body}</p>
          </div>
        ))}
    </div>
  );
};

export default App;
