import React from "react";

export default docs=>{
    docs.chapter("index")
        .page("index", ()=><div>main docs</div>)
        .page("icon", ()=><div>test</div>);
};
