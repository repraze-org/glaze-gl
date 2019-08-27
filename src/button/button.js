import React from "react";
import PropTypes from "prop-types";

export default function Button({children}){
    return <button>{children}</button>;
}

Button.propTypes = {
    children: PropTypes.node
};
