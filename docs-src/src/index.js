import React from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";
import {HashRouter as Router, Route, Link} from "react-router-dom";

import "./documentation.sass";
import Logo from "./logo";
import Docs from "docs";

const documentation = new Docs();
documentation.load(require.context("../../src", true, /.docs.js$/));

function DocNavigagtion(){
    return (
        <div className="docs-nav">
            <div className="docs-nav-scroller">
                <div className="docs-nav-title">
                    <span className="docs-logo" title="Glaze">
                        <Logo />
                    </span>
                    <span className="docs-name" title="Glaze">
                        <Link to={"/"}>Glaze</Link>
                    </span>
                </div>
                <ul className="docs-nav-menu">
                    {documentation
                        .pages()
                        .map(page=><li key={page.key}>
                            <Link to={page.path}>{page.name}</Link>
                            <Route path={`${page.path}.:id?`} exact component={()=><ul className="docs-nav-menu">
                                {page.sections().map(section=><li key={section.key}>
                                    <Link to={`${page.path}.${section.key}`}>{section.name}</Link>
                                </li>)}
                            </ul>} />
                        </li>)}
                </ul>
            </div>
        </div>
    );
}

function DocSection({
    title,
    section,
}){
    const Section = section.component;
    return <div className="docs-section">
        {title && <h2>{title}</h2>}
        {<Section/>}
    </div>;
}

DocSection.propTypes = {
    title:   PropTypes.string,
    section: PropTypes.any
};

function DocPage({
    title,
    page,
    id,
}){
    console.log("Should scroll to" + id);
    return <div className="docs-page">
        <h1>{title}</h1>
        {page.index() && <DocSection section={page.index()}/>}
        {page
            .sections()
            .map(section=><DocSection key={section.key} title={section.name} section={section}/>)}
    </div>;
}

DocPage.propTypes = {
    title: PropTypes.string,
    page:  PropTypes.any,
    id:    PropTypes.string,
};

function DocContent(){
    return <div className="docs-content">
        <Route path={"/"} exact component={()=><DocPage title="Glaze" page={documentation.index()}/>} />
        {documentation
            .pages()
            .map(page=><Route key={page.key} path={`${page.path}.:id?`} exact component={({match})=>{
                let id = null;
                if(match.params && match.params.id){
                    id = match.params.id;
                }
                return <DocPage title={page.name} page={page} id={id}/>;
            }} />)}
    </div>;
}

function Doc(){
    return (
        <div className="docs-root">
            <div className="docs-wrapper">
                <Router>
                    <DocNavigagtion />
                    <DocContent />
                </Router>
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
