import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import api from "../api"; 

const localizer = momentLocalizer(moment);

const CalendarReact = ({ CurrUserId ,OnlyShowUserIdList, colorDict, role}) => {
  console.log("currUserId in CalendarReact:", CurrUserId);
  const [currentView, setCurrentView] = useState("month");
  const [events, setEvents] = useState([]);

  // to do FILTER CALANDER BASED ON THIS
  const startHour = 7;
  const endHour = 22;
  const minTime = new Date();
  minTime.setHours(startHour, 0, 0);
  const maxTime = new Date();
  maxTime.setHours(endHour, 0, 0);



  useEffect(() => {
    fetchEvents();
  }, [CurrUserId, OnlyShowUserIdList]);

  const fetchEvents = () => {
    // empty the events array
    setEvents([]);
    OnlyShowUserIdList.map((id) => {
      console.log("Fetching events for user with id:", id);
      api
        .get("api/terms/user/" + id + "/")
        .then((res) => {
          const formattedEvents = res.data.map((event) => ({
            start: new Date(event.start_date),
            end: new Date(event.end_date),
            player_id: id,
            type: "show",
          }));
          setEvents((prevEvents) => [...prevEvents, ...formattedEvents]);
        })
        .catch((error) => console.error("Error fetching events:", error));
    })
      api
        .get("api/terms/user/" + CurrUserId + "/")
        .then((res) => {
          const formattedEvents = res.data.map((event) => ({
            start: new Date(event.start_date),
            end: new Date(event.end_date),
            player_id: CurrUserId,
            type: "edit",
          }));
          setEvents((prevEvents) => [...prevEvents, ...formattedEvents]);
        })
        .catch((error) => console.error("Error fetching events:", error));
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
    events.filter(event => event.type === "edit").map((event) => {
      if (event.start <= end && start <= event.end) {
        start = start < event.start ? start : event.start;
        end = end > event.end ? end : event.end;
      }
    });
    const filteredEvents = events.filter(event => event.type !== 'edit' || !(event.start < end && start < event.end));
    const newEvent = {
      start,
      end,
      player_id: CurrUserId,
      type: "edit",
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
        events.filter(event => event.type === 'edit').map((event) => {
          createTerm(event.start, event.end);
        });
      });
    }
  };
  const slotPropGetter = (date) => {
    const now = new Date();
    now.setMinutes(Math.ceil(now.getMinutes() / 30) * 30); // Normalize to start of day for comparison
    // Check if the slot is in the past, before the start hour, or after the end hour
    const hour = date.getHours();

    if (date < now || hour < startHour || hour > endHour) {
      return {
        style: {
          backgroundColor: '#e9ecef', // Set background color to gray
        },
      };
    }
    else {
      return {
        style: {
          backgroundColor: 'white', // Set background color to white
        },
      };
    }
  };



  // Define the eventPropGetter function
  const eventPropGetter = (event) => {
    console.log("event:", event);
    let color_edge = "#0d6efd"; // Declare color variable outside the if-else blocks
    let color_background = "#0d6efd";
    let color_text = "white";
    if (event.type === "show") {
      color_edge = colorDict[event.player_id];
      color_background = "#fafafa"
      color_text = "gray";
    }
  

    let newStyle = {
      backgroundColor: color_background, // Very light gray for background
      color: color_text, // White for text color
      border: "none", // No border on all sides
      borderLeft: `5px solid ${color_edge}`, // Colored left border only
    };

    return {
      style: newStyle,
    };
  };

  const EventComponent = ({ event }) => {
    const buttonStyle = {
      //marginLeft: "10px",
      //marginRight: "10px",
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
      backgroundColor: "white",
      borderRadius: "50%",
      color: "#007bff",
      //marginLeft: "5px",
    };

    console.log("event in EventComponent:", event);
    
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span>{event.title}</span>
        {event.type === "edit" && (
          <button onClick={() => handleDeleteEvent(event)} style={buttonStyle}>
            <i className="bi bi-x-lg" style={iconStyle}></i>
          </button>
        )}
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
        min = {minTime}
        max = {maxTime}
        selectable
        style={{ height: 1000 }}
        onSelectSlot={handleSelectSlot}
        onView={handleViewChange}
        view="week"
        views={["week"]}
        defaultView={currentView}
        //dayPropGetter={dayPropGetter}
        eventPropGetter={eventPropGetter}
        slotPropGetter={slotPropGetter}
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
