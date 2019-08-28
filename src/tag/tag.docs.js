import React from "react";
import {Button} from "glaze";

export default (docs)=>{
    docs.page("Tag")
        .section("index", ()=><div>
            <Button>test</Button>
        </div>)
        .section("icon", ()=><div>
            test
        </div>);
};
