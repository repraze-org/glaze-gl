import React from "react";
import ReactDOM from "react-dom";

function Documentation(){
    return <span>test ok</span>;
}

function docs(root){
    ReactDOM.render(<Documentation />, root);
}

if(window){
    window.docs = docs;
}

export default docs;
