import React from "react";
import PropTypes from "prop-types";
import {Route, Link} from "react-router-dom";

import {Documentation} from "docs";

import Logo from "./logo";

export default function Navigagtion({documentation}){
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
                    {documentation.chapters().map(chapter=>(
                        <li key={chapter.key}>
                            <Link to={chapter.path}>{chapter.name}</Link>
                            <Route
                                path={`${chapter.path}.:id?`}
                                exact
                                component={()=>(
                                    <ul className="docs-nav-menu">
                                        {chapter.pages().map(page=>(
                                            <li key={page.key}>
                                                <Link to={`${chapter.path}.${page.key}`}>{page.name}</Link>
                                            </li>
                                        ))}
                                        {chapter.chapters().map(chapter=>(
                                            <li key={chapter.key}>
                                                <Link to={`${chapter.path}`}>{chapter.name}</Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

Navigagtion.propTypes = {
    documentation: PropTypes.instanceOf(Documentation)
};
