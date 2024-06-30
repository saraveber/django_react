import React, { useState } from 'react';
import Form from "../components/Form";

function ChangePassword() {
    return (
        <Form route="api/user/change-password/" method="changePassword"/>
    );
}

export default ChangePassword;