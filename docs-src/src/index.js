import React from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";
import {HashRouter as Router} from "react-router-dom";

import "./documentation.sass";

import {Book} from "docs";

import Navigagtion from "./components/navigation";
import Content from "./components/content";

function GlazeDoc({documentation}){
    return (
        <div className="docs-root">
            <div className="docs-wrapper">
                <Router>
                    <Navigagtion documentation={documentation} />
                    <Content documentation={documentation} />
                </Router>
            </div>
        </div>
    );
}

GlazeDoc.propTypes = {
    documentation: PropTypes.instanceOf(Book)
};

function docs(root){
    const documentation = new Book();
    documentation.load(require.context("../../src", true, /.docs.js$/));

    ReactDOM.render(<GlazeDoc documentation={documentation} />, root);
}

if(window){
    window.docs = docs;
}

export default docs;
