import React from "react";
import "../styles/Note.css";

function Note({note,onDelete}) {
    const formatDate = new Date(note.date).toLocaleDateString("en-GB", { timeZone: "Europe/Berlin" });

    return (
        <div className="note-container">
            <p className="note-title">"{note.title}</p>
            <p className="note-content">{note.content}</p>
            <p className="note-date">{formatDate}</p>
            <button onClick={() => onDelete(note.id)}>
                Delete
            </button>
        </div>
    );
}
export default Note;    