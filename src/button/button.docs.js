import React from "react";
import {Button} from "glaze";

export default (docs)=>{
    docs.page("Button")
        .section("index", ()=><div>
            <Button>test</Button>
        </div>)
        .section("icon", ()=><div>
            test
        </div>);
};
