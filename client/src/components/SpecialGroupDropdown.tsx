import { useEffect, useRef, useState } from "react";
import plus from "../assets/plus.svg";
import x from "../assets/greenX.svg";
import alert from "../assets/alert.svg";
import check from "../assets/check.svg";

interface testList {
  
    url: string;
    tags: string[];
    title: string;
}

interface testStateList {
  query: string;
  list: testList[];
}

export const Dropdown = () => {

  const [state, setstate] = useState<testStateList>({
    query: '',
    list: []
    })
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    // result filtering based on input
    const results = posts.filter(post => {
    if (e.target.value === "") return posts
    return post.title.toLowerCase().includes(e.target.value.toLowerCase())
    })
    setstate({
    query: e.target.value,
    list: results
    })

    // show/hide dropdown
    const dropdown = document.getElementById("specialGroupDropdown");
    if (dropdown != null) {
      if (e.target.value === "") { dropdown.style.display = "none" }
      else { dropdown.style.display = "block" }
    }
  }
  
  const posts = [
  {
  url: '',
  tags: ['react', 'blog'],
  title: 'How to create a react search bar',
  },
  {
  url:'',
  tags: ['node','express'],
  title: 'How to mock api data in Node',
  },
  // more data here
  ]

  return (

    <div className="px-4 py-2">

      {/* Special Group Input */} 
      <div className="flex flex-row items-center">
        <form>
        <input className="w-72 h-8 border-2 border-softGrayWhite rounded-lg text-lg text-newLeafGreen placeholder:text-lg placeholder:text-newLeafGreen placeholder:text-opacity-40 focus:outline-softGrayWhite pl-2 pr-7"
        type="text" id="specialGroupInput" placeholder="Search through groups..." value={state.query} onChange={handleChange}></input>
        </form>
        <button>
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
          return <li className="flex flex-row rounded-lg hover:cursor-pointer hover:bg-softGrayWhite px-2" key={post.title}>
            <img
              className="w-2 mr-1 md:w-4"
              src={ plus }
              alt="plus-icon"
            /> 
          {post.title}
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