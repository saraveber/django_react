import React from "react";
import { useState, useEffect } from "react";
import api from "../api";

function Home() {
    const [notes, setNotes] = useState([]);
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");

    useEffect(() => {
        getNotes();
    }, []);

    const getNotes = () => {
        api
            .get("api/notes/")
            .then((res) => res.data)
            .then((data) => setNotes(data))
            .catch((error) => alert(error));
    };

    const deleteNote = (id) => {
        api
            .delete(`api/notes/delete/${id}`)
            .then((res) => {
                if (res.status === 204) alert("Note deleted successfully");
                else alert("Error deleting note");
            })
            .catch((error) => alert(error));
        getNotes(); // Refresh notes
    };

    const createNote = (e) => {
        e.preventDefault();
        api
            .post("api/notes/create/", { title, content })
            .then((res) => {
                if (res.status === 201) alert("Note created successfully");
                else alert("Error creating note");
            })
            .catch((error) => alert(error));
        getNotes(); // Refresh notes
    };
return (
        <div>
                <div>
                        <h2>Notes</h2>
                </div>
                <div>
                        <h2>Create a note</h2>
                        <form onSubmit={createNote}>
                                <label htmlFor="title">Title:</label>
                                <br />
                                <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        required
                                        onChange={(e) => setTitle(e.target.value)}
                                        value={title}
                                />
                                <br />

                                <label htmlFor="content">Content</label>
                                <br />
                                <textarea
                                        type="text"
                                        id="content"
                                        name="content"
                                        required
                                        onChange={(e) => setContent(e.target.value)}
                                        value={content}
                                ></textarea>
                                <br />
                                <input type="submit" value="Submit" />
                        </form>
                </div>
        </div>
);
}

export default Home;
