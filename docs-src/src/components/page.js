import React, {useRef, useEffect} from "react";
import PropTypes from "prop-types";

import {Page} from "docs";

function scroll(ref){
    if(ref.current){
        window.scrollTo(0, ref.current.offsetTop - 100);
    }else{
        console.warn("Could not scroll to ref.");
    }
}

export default function PageView({title, page, view}){
    const Component = page.component;
    const sectionRef = useRef(null);
    useEffect(()=>{
        if(view && page.key === view){
            scroll(sectionRef);
        }
    });
    return (
        <div className="docs-section" ref={sectionRef}>
            {title && <h2>{title}</h2>}
            {<Component />}
        </div>
    );
}

PageView.propTypes = {
    title: PropTypes.string,
    page:  PropTypes.instanceOf(Page),
    view:  PropTypes.string
};
