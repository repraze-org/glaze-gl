import React from "react";
import PropTypes from "prop-types";

import {Chapter} from "docs";

import Page from "./page";

export default function ChapterView({title, chapter, view}){
    return (
        <div className="docs-page">
            <h1>{title}</h1>
            {chapter.index() && <Page page={chapter.index()} view={view} />}
            {chapter.pages().map(page=>(
                <Page key={page.key} title={page.name} page={page} view={view} />
            ))}
        </div>
    );
}

ChapterView.propTypes = {
    title:   PropTypes.string,
    chapter: PropTypes.instanceOf(Chapter),
    view:    PropTypes.string
};
