import React from "react";
import {Button} from "glaze";

export default docs=>{
    docs.chapter("Button")
        .page("index", ()=>(
            <div>
                <Button>test</Button>
                {Array(5000)
                    .fill(null)
                    .map(w=>"test")
                    .join(" ")}
            </div>
        ))
        .page("icon", ()=>(
            <div>
                {Array(5000)
                    .fill(null)
                    .map(w=>"test")
                    .join(" ")}
            </div>
        ))
        .page("something", ()=>(
            <div>
                {Array(5000)
                    .fill(null)
                    .map(w=>"test")
                    .join(" ")}
            </div>
        ));
};
