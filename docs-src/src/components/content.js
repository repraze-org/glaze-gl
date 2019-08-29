import React from "react";
import PropTypes from "prop-types";
import {Route} from "react-router-dom";

import {Book} from "docs";

import Chapter from "./chapter";

export default function Content({documentation}){
    return (
        <div className="docs-content">
            <Route path={"/"} exact component={()=><Chapter title="Glaze" chapter={documentation.index} />} />
            {documentation.deepChapters().map(chapter=>(
                <Route
                    key={chapter.key}
                    path={`${chapter.path}.:view?`}
                    exact
                    component={({match})=>{
                        let view = "index";
                        if(match.params && match.params.view){
                            view = match.params.view;
                        }
                        return <Chapter title={chapter.name} chapter={chapter} view={view} />;
                    }}
                />
            ))}
        </div>
    );
}

Content.propTypes = {
    documentation: PropTypes.instanceOf(Book)
};
