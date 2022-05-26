import React, { useState, useEffect, useRef } from 'react';

// custom hook to synchronize state with local storage
const useSemiPersistentState = (key, initialState) => {
  const [value, setValue] = useState(
    localStorage.getItem(key) || initialState
  );

  // side effect runs each time the value changes as well as when the 
  // component is initialized
  useEffect(() => {
    // update the value in local storage whenever it changes
    localStorage.setItem(key, value);
  }, [value, key]);

  // return the current value as well as the updater function
  return [value, setValue];
};

const initialStories = [
  {
    title: 'React',
    url: 'https://reactjs.org/',
    author: 'Jordan Walke',
    num_comments: 3,
    points: 4,
    objectID: 0,
  },
  {
    title: 'Redux',
    url: 'https://redux.js.org/',
    author: 'Dan Abramov, Andrew Clark',
    num_comments: 2,
    points: 5,
    objectID: 1,
  },
];

const getAsyncStories = () => (
  new Promise((resolve) => (
    // simulate real-world asynchrounous data fetching by setting a delay
    // prior to returning the data
    setTimeout(
      () => resolve({ data: { stories: initialStories } }),
      2000
    )
  ))
);

const App = () => {
  const [searchTerm, setSearchTerm] = useSemiPersistentState('search','');

  const [stories, setStories] = useState([]);

  useEffect(() => {
    // fetch the asynchronous data
    getAsyncStories().then(result => {
      // set the state to the fetched data
      setStories(result.data.stories);
    });
  }, []);

  const handleRemoveStory = (item) => {
    const newStories = stories.filter(
      // get all stories whose ID are not equal to that of the story to remove
      // and store in a new array
      (story) => item.objectID !== story.objectID
    );

    // set the state to the new array
    setStories(newStories);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const searchedStories = stories.filter((story) => 
    story.title.toLowerCase().includes(searchTerm.toLowerCase()) 
  );

  return (
    <div>
      <h1>My Hacker Stories</h1>

      <InputWithLabel
        id="search"
        value={searchTerm}
        isFocused
        onInputChange={handleSearch}
      >
        <strong>Search:</strong>
      </InputWithLabel>

      <hr />

      <List list={searchedStories} onRemoveItem={handleRemoveStory} />
    </div>
  )
};

const InputWithLabel = ({ 
  id, 
  value, 
  type = 'text',
  onInputChange,
  isFocused,
  children,
}) => {
  const inputRef = useRef();

  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  return (
    <>
      <label htmlFor={id}>{children}</label>
      &nbsp;
      <input
        ref={inputRef}
        id={id}
        type={type}
        value={value}
        onChange={onInputChange}
      />
    </>
  );
};

const List = ({ list, onRemoveItem }) => (
  <ul>
    {list.map((item) => (
      <Item 
        key={item.objectID} 
        item={item} 
        onRemoveItem={onRemoveItem}
      />
    ))}
  </ul>
);

// alternative more concise version using the spread and rest operators
// const List = ({ list }) => (
//   <ul>
//     {list.map(({ objectID, ...item }) => (
//       <Item key={objectID} {...item} />
//     ))}
//   </ul>  
// );

const Item = ({ item, onRemoveItem }) => {
  return (
    <li>
      <span>
        <a href={item.url}>{item.title}</a>
      </span>
      <span>{item.author}</span>
      <span>{item.num_comments}</span>
      <span>{item.points}</span>
      <span>
        <button type="button" onClick={() => onRemoveItem(item)}>
          Dismiss
        </button>
      </span>
    </li>
  );
};

// alternative more concise version using object destructuring
// const Item = ({ title, url, author, num_comments, points }) => (
//   <li>
//     <span>
//       <a href={url}>{title}</a>
//     </span>
//     <span>{author}</span>
//     <span>{num_comments}</span>
//     <span>{points}</span>
//   </li>
// );

export default App;