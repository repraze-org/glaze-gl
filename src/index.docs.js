import React from "react";

export default (docs)=>{
    docs.page("index")
        .section("index", ()=><div>
            main docs
        </div>)
        .section("icon", ()=><div>
            test
        </div>);
};
