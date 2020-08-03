import React from "react";
import { Progress } from "semantic-ui-react";

const ProcessBar = ({ uploadState, percentUploaded }) =>
    uploadState && (
        <Progress
            className="process__bar"
            percent={percentUploaded}
            progress
            indicating
            size="medium"
            inverted
        />
    );

export default ProcessBar;
