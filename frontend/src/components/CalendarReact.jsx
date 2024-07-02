import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import { useUser } from "../context/UserContext";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import api from "../api"; 

const localizer = momentLocalizer(moment);

const CalendarReact = ({ CurrUserId ,role}) => {
  console.log("currUserId in CalendarReact:", CurrUserId);
  const [otherSelectedUserIdList, setOtherSelectedUserId] = useState([6,7,8,9]);
  const [currentView, setCurrentView] = useState("month");
  const [events, setEvents] = useState([]);

  // to do FILTER CALANDER BASED ON THIS
  const start_hour = 7;
  const end_hour = 22;




  useEffect(() => {
    console.log("Events in useEffect:", events);
    fetchEvents();

  }, [CurrUserId]);

  const fetchEvents = () => {
    // empty the events array
    setEvents([]);

    console.log("Fetching events...");
    otherSelectedUserIdList.map((id) => {
      console.log("Fetching events for user with id:", id);
      api
        .get("api/terms/user/" + id + "/")
        .then((res) => {
          const formattedEvents = res.data.map((event) => ({
            start: new Date(event.start_date),
            end: new Date(event.end_date),
            player_id: id,
          }));
          console.log("Formatted events:", formattedEvents);
          // add the formatted events to the events array

          setEvents((prevEvents) => [...prevEvents, ...formattedEvents]);
          console.log("Events in fetchEvents:", events);
        })
        .catch((error) => console.error("Error fetching events:", error));
    });
    console.log("Events fetched!", events);

  };

  const handleDeleteEvent = (event) => {
    setEvents(
      events.filter((e) => e.start !== event.start && e.end !== event.end)
    );
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  const handleSelectSlot = ({ start, end }) => {
    const now = new Date();
    // round now to 30 minutes
    now.setMinutes(Math.ceil(now.getMinutes() / 30) * 30);
    if (end < now) {
      return;
    }
    if (start < now) {
      start = now;
    }
    const startDate = moment(start).format("YYYY-MM-DD");
    const endDate = moment(end).format("YYYY-MM-DD");
    events.map((event) => {
      if (event.start <= end && start <= event.end) {
        start = start < event.start ? start : event.start;
        end = end > event.end ? end : event.end;
      }
    });
    const filteredEvents = events.filter(event => !(event.start < end && start < event.end));
    const newEvent = {
      start,
      end,
    };
    setEvents([...filteredEvents, newEvent]);
    console.log("FINISHED FILTERING");
  };



  const createTerm = (start_date, end_date) => {
    console.log("Role in createTerm:", role);
    if (role === "admin" || role === "staff") {
      api
        .post("api/terms/by-user/", { user: CurrUserId, start_date, end_date })
        .then((res) => {
          if (res.status === 201) console.log("Term saved!");
          else alert("Failed to make term.");
        })
        .catch((err) => alert(err));
    }
  };

  const handleSubmit = async () => {
    const eventsString = events.map(event => `Start: ${event.start}, End: ${event.end}`).join('\n');
    const isConfirmed = window.confirm(`Submitting these terms:\n${eventsString}\nDo you want to proceed?`);
    if (!isConfirmed) return;
    // map through the events and send a POST request for each one
    if (role === "admin" || role === "staff") {
      api.delete(`api/terms/delete-all/user/${CurrUserId}/`).then((res) => {
        if (res.status === 204) {
          console.log("All terms deleted!");
        }
        events.map((event) => {
          createTerm(event.start, event.end);
        });
      });
    }
  };

  const dayPropGetter = (date) => {
    const now = new Date();
    now.setMinutes(Math.ceil(now.getMinutes() / 30) * 30);// Normalize to start of day for comparison
    if (date < now) {
      // If the date is in the past, return a style object with a gray background
      return {
        style: {
          backgroundColor: "#e9ecef",
        },
      };
    }
    else {
      // If the date is in the future, return a style object with a white background
      return {
        style: {
          backgroundColor: "white",
        },
      };
    }
  };
  // Define the eventPropGetter function
  const eventPropGetter = (event) => {
    const colors = ["#007bff", "#A459D1",  "#F266AB" ,"#FFB84C" , "#2CD3E1"]
    let i = event.player_id % colors.length;
    let color = colors[i];

    let newStyle = {
      backgroundColor: "#f7f7f7", // Very light gray for background
      color: "gray",
      border: "none", // No border on all sides
      borderLeft: `5px solid ${color}`, // Colored left border only
      width: '25%', // Set the width to 1/4 of a day
    };

    return {
      style: newStyle,
    };
  };

  const EventComponent = ({ event }) => {
    const buttonStyle = {
      marginLeft: "10px",
      marginRight: "10px",
      color: "#007bff",
      border: "none",
      backgroundColor: "transparent",
      cursor: "pointer",
    };

    const iconStyle = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: "20px",
      height: "20px",
      backgroundColor: "#007bff",
      borderRadius: "50%",
      color: "white",
      marginLeft: "5px",
    };

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span>{event.title}</span>
        <button onClick={() => handleDeleteEvent(event)} style={buttonStyle}>
          <i className="bi bi-x-lg" style={iconStyle}></i>
        </button>
      </div>
    );
  };

  return (
    <div>
      <Calendar
        dayLayoutAlgorithm={"no-overlap"}
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable
        style={{ height: 700 }}
        onSelectSlot={handleSelectSlot}
        onView={handleViewChange}
        view="week"
        views={["week"]}
        defaultView={currentView}
        dayPropGetter={dayPropGetter}
        eventPropGetter={eventPropGetter}
        components={{
          event: EventComponent,
        }}
      />
      <button className="submit-button" onClick={handleSubmit}>
        Submit
      </button>
    </div>
  );
};

export default CalendarReact;
