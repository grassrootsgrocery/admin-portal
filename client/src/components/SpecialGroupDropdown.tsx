import { useEffect, useRef, useState } from "react";
import plus from "../assets/plus.svg";
import x from "../assets/greenX.svg";
import alert from "../assets/alert.svg";
import check from "../assets/check.svg";

interface testStateList {
  query: string;
  list: string[];
} 

// show/hide dropdown and clear button
function showHideElements() {
  const input = document.getElementById('specialGroupInput') as HTMLInputElement;
  const dropdown = document.getElementById("specialGroupDropdown");
  const clearButton = document.getElementById("clearBtn");

  if (dropdown != null && clearButton != null) {
    if (input.value === "") { 
      dropdown.style.display = "none";
      clearButton.style.display = "none";
    }
    else { 
      dropdown.style.display = "block";
      clearButton.style.display = "block"; 
    }
  }
}
export const Dropdown = () => {

  const posts = [
    'How to create a react search bar', 
    'How to mock api data in Node',
    ]

  const [state, setstate] = useState<testStateList>({
    query: '',
    list: []
    })
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    // result filtering based on input
    const results = posts.filter(post => {
    if (e.target.value === "") return posts
    return post.toLowerCase().includes(e.target.value.toLowerCase())
    })
    setstate({
    query: e.target.value,
    list: results
    })

    showHideElements();
  }

  // clear input
  const inputRef = useRef<HTMLInputElement>(null);
  const clearInput = () => {
    if (inputRef.current != null) {
      inputRef.current.value = '';
      setstate({query: '', list: []});
      showHideElements();
    }
  }
  
  return (

    <div className="px-4 py-2">

      {/* Special Group Input */} 
      <div className="flex flex-row items-center">
        <form>
        <input className="w-72 h-8 border-2 border-softGrayWhite rounded-lg text-lg text-newLeafGreen placeholder:text-lg placeholder:text-newLeafGreen placeholder:text-opacity-40 focus:outline-softGrayWhite pl-2 pr-7"
        ref={inputRef} type="text" id="specialGroupInput" placeholder="Search through groups..." value={state.query} onChange={handleChange}></input>
        </form>

        {/* Clear button */} 
        <button hidden id="clearBtn" onClick={clearInput}>
            <img 
              className="relative bottom-0.25 right-6 w-3 sm:w-4" 
              src={x} 
              alt="x" 
            />
        </button>
      </div>
      
      {/* Special Group Listing Dropdown */} 
      <ul className="hidden w-72 border-2 border-t-0 border-softGrayWhite rounded-lg text-newLeafGreen py-1"
      id="specialGroupDropdown">

        <div className="text-sm text-[#0E7575] px-2">
          Select existing group or create new one
        </div>

        {(state.query === '' ? "" : state.list.map(post => {
          return <li className="flex flex-row rounded-lg hover:cursor-pointer hover:bg-softGrayWhite px-2">
            <img
              className="w-2 mr-1 md:w-4"
              src={plus}
              alt="plus-icon"
            /> 
          {post}
          </li>
        }))}
        
        <li className="flex flex-row rounded-lg hover:cursor-pointer hover:bg-softGrayWhite px-2">
          Create: 
          <div className="pl-2 text-[#0E7575]">
            {state.query} 
          </div>
        </li>

      </ul> 

      {/* Aleady registered message */}
      <div className="flex flex-row items-center">
        <img
          className="mt-1 w-4 md:w-6 lg:w-7"
          src={alert}
          alt="alert-icon"
        /> 
        <div className="flex flex-col items-center leading-5 px-2 font-semibold text-newLeafGreen">
          <div> This group is already registered for </div> 
          <div> the event! </div>
        </div>
      </div>

      {/* Ready message */}
      <div className="flex flex-row items-center">
        <img
          className="mt-1 w-4 md:w-6 lg:w-7"
          src={check}
          alt="check-icon"
        /> 
        <div className="flex flex-col items-center leading-5 px-4 font-semibold text-newLeafGreen">
          Ready to generate link!
        </div>
      </div>
    </div>
    
  );
};