
import { useState, useEffect } from "react";
import api from "../api";
import Calendar from '../components/Calendar';

function MyTerms() {
    return (
        <div>
            <Calendar />            
        </div>
    );
}

export default MyTerms;