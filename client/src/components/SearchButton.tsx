import React, { useState } from 'react';
import "./SearchButton.css";


export const SearchButton = () => {
    const [input, setInput] = useState("");

    return (
        <div className="searchButton">
            <label>Search</label>
            <input type="text" 
            value = {input}
            onChange={e => setInput(e.target.value)}></input>
        </div>
    );
};

