import React from "react";
import ReactDOM from "react-dom";

import "./documentation.sass";
import Logo from "./logo";

// import {Button} from "glaze";

function DocNavigagtion(){
    return (
        <div className="docs-nav">
            <div className="docs-nav-scroller">
                <div className="docs-nav-title">
                    <span className="docs-logo" title="Glaze">
                        <Logo />
                    </span>
                    <span className="docs-name" title="Glaze">
                        Glaze
                    </span>
                </div>
                <ul className="docs-nav-menu">
                    {Array(50)
                        .fill(0)
                        .map((e, index)=>(
                            <li key={index}>Button {index}</li>
                        ))}
                </ul>
            </div>
        </div>
    );
}

function DocContent(){
    return <div className="docs-content">test</div>;
}

function Doc(){
    return (
        <div className="docs-root">
            <div className="docs-wrapper">
                <DocNavigagtion />
                <DocContent />
            </div>
        </div>
    );
}

function docs(root){
    ReactDOM.render(<Doc />, root);
}

if(window){
    window.docs = docs;
}

export default docs;
