import React from "react";
import PropTypes from "prop-types";
import {Route, NavLink} from "react-router-dom";

import {Book, Chapter} from "docs";

import Logo from "./logo";

function ChapterNavigation({
    chapter
}){
    const {pages, chapters} = chapter;
    if(pages.length === 0 && chapters.length === 0){
        return null;
    }
    return <ul className="docs-nav-menu">
        {pages.map(page=>(
            <li key={page.key}>
                <NavLink exact className="docs-nav-item docs-nav-page" activeClassName="active" to={`${chapter.path}.${page.key}`}>{page.name}</NavLink>
            </li>
        ))}
        {chapters.map(chapter=>(
            <li key={chapter.key}>
                <NavLink exact className="docs-nav-item docs-nav-chapter" activeClassName="active" to={`${chapter.path}`}>{chapter.name}</NavLink>
                <ChapterNavigation chapter={chapter}/>
            </li>
        ))}
    </ul>;
}

ChapterNavigation.propTypes = {
    chapter: PropTypes.instanceOf(Chapter)
};

export default function Navigagtion({documentation}){
    const {chapters} = documentation;
    return (
        <div className="docs-nav">
            <div className="docs-nav-scroller">
                <div className="docs-nav-title">
                    <span className="docs-logo" title="Glaze">
                        <Logo />
                    </span>
                    <span className="docs-name" title="Glaze">
                        <NavLink exact to={"/"}>Glaze</NavLink>
                    </span>
                </div>
                <ul className="docs-nav-menu">
                    {chapters.map(chapter=>(
                        <li key={chapter.key}>
                            <NavLink exact className="docs-nav-item docs-nav-chapter" activeClassName="active" to={chapter.path}>{chapter.name}</NavLink>
                            <Route
                                path={`${chapter.path}.:view?`}
                                component={()=>(
                                    <ChapterNavigation chapter={chapter}/>
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
    documentation: PropTypes.instanceOf(Book)
};
