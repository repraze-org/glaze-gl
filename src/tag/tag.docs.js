import React from "react";
import {Button} from "glaze";

export default docs=>{
    docs.chapter("Tag")
        .page("index", ()=>(
            <div>
                <Button>test</Button>
            </div>
        ))
        .page("icon", ()=><div>test</div>);
};
