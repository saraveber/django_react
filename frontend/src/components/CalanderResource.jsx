import React, { useState, useEffect, useRef } from "react";
import { useUser } from "../context/UserContext";
import "../styles/Home.css";
import api from "../api";
import FullCalendar from "@fullcalendar/react";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import adaptivePlugin from "@fullcalendar/adaptive";
import resourceTimeGridPlugin from "@fullcalendar/resource-timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import rrulePlugin from "@fullcalendar/rrule";
import moment from "moment";
import "../styles/CalanderResource.css";
import bootstrap5Plugin from "@fullcalendar/bootstrap5";
import "bootstrap-icons/font/bootstrap-icons.css";
import UserColorSquare from "./UserColorSquare";

const hexToRgba = (hex, alpha = 1) => {
    if (!hex || typeof hex !== "string") {
        console.error("Invalid hex value:", hex);
        return "rgba(0, 0, 0, 1)";
    }
    hex = hex.replace(/^#/, "");

    let bigint;
    if (hex.length === 3) {
        bigint = parseInt(
            hex
                .split("")
                .map((char) => char + char)
                .join(""),
            16
        );
    } else if (hex.length === 6) {
        bigint = parseInt(hex, 16);
    } else {
        console.error("Invalid hex length:", hex);
        return "rgba(0, 0, 0, 1)";
    }

    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const CalendarResource = ({
    initialCurrUserId = null,
    playerList = [],
    colorDict = {},
    role = null,
}) => {
    const [resources, setResources] = useState([]);
    const [events, setEvents] = useState([]);
    const [currUserId, setCurrUserId] = useState(initialCurrUserId);
    const [rerenderKey, setRerenderKey] = useState(0);

    useEffect(() => {
        updateResources(playerList);
        fetchEvents();
    }, [playerList]);

    useEffect(() => {
        setCurrUserId(initialCurrUserId);
    }, [initialCurrUserId]);

    const updateResources = async () => {
        setResources(
            playerList.map((player) => {
                return {
                    id: player.user,
                    title: player.name + " " + player.surname,
                };
            })
        );
        console.log("Resources:", resources);
    };

    const fetchAndFormatPlayerEvents = async (player) => {
        try {
            const res = await api.get(`api/terms/user/${player.user}/`);
            const formattedData = res.data.map((event) => ({
                player_id: player.user,
                start: new Date(event.start_date),
                end: new Date(event.end_date),
                resourceId: player.user,
                type: player.user === currUserId ? "edit" : "show",
                submitted: "submitted",
                borderColor: hexToRgba(colorDict[player.user], 1),
                backgroundColor:
                    player.user === currUserId
                        ? hexToRgba(colorDict[player.user], 1)
                        : hexToRgba(colorDict[player.user], 0.3),
            }));
            return formattedData;
        } catch (error) {
            console.error(
                `Error fetching events for player ${player.user}:`,
                error
            );
            return [];
        }
    };

    const filterEvents = (events) => {
        const now = new Date();
        now.setMinutes(Math.ceil(now.getMinutes() / 30) * 30);
        return events.filter((event) => {
            const end = new Date(event.end);
            return end >= now;
        });
    };

    const fetchEvents = async () => {
        let tempEvents = [];
        for (const player of playerList) {
            const events = await fetchAndFormatPlayerEvents(player);
            tempEvents = [...tempEvents, ...events];
        }
        tempEvents = filterEvents(tempEvents);
        setEvents(tempEvents);
    };

    const handleSelectSlot = ({ start, end }) => {
        const now = new Date();
        now.setMinutes(Math.ceil(now.getMinutes() / 30) * 30);
        if (end < now) return;
        if (start < now) start = now;

        const startDate = moment(start).format("YYYY-MM-DD");
        const endDate = moment(end).format("YYYY-MM-DD");
        events
            .filter((event) => event.type === "edit")
            .forEach((event) => {
                if (event.start <= end && start <= event.end) {
                    start = start < event.start ? start : event.start;
                    end = end > event.end ? end : event.end;
                }
            });
        const filteredEvents = events.filter(
            (event) =>
                event.type !== "edit" ||
                !(event.start < end && start < event.end)
        );
        const newEvent = {
            player_id: currUserId,
            start,
            end,
            resourceId: currUserId,
            type: "edit",
            submitted: "not submitted",
            borderColor: hexToRgba(colorDict[currUserId], 1),
            backgroundColor: hexToRgba(colorDict[currUserId], 1),
        };
        setEvents([...filteredEvents, newEvent]);
        console.log("Event added:");
    };

    const selectAllow = (selectInfo) => {
        const allowedResourceIds =
            currUserId !== null ? [currUserId.toString()] : [];

        const start = selectInfo.start;
        const end = selectInfo.end;

        const isSameDay =
            start.getUTCDate() === end.getUTCDate() &&
            start.getUTCMonth() === end.getUTCMonth() &&
            start.getUTCFullYear() === end.getUTCFullYear();

        return allowedResourceIds.includes(selectInfo.resource.id) && isSameDay;
    };

    const handleDeleteEvent = (event) => {
        setEvents(
            events.filter((e) => {
                return (
                    (e.start.getTime() !== event.start.getTime() &&
                        e.end.getTime() !== event.end.getTime()) ||
                    e.player_id !== event.extendedProps.player_id
                );
            })
        );
    };

    const renderEventContent = (eventInfo) => {
        const eventType = eventInfo.event.extendedProps.type; // Assuming the type is stored in extendedProps
        const submitted = eventInfo.event.extendedProps.submitted;
        const iconStyle = {
            backgroundColor: currUserId
                ? hexToRgba(colorDict[currUserId], 1)
                : "transparent",
            color: "white",
        };

        const buttonStyle = {
            border: "none",
            backgroundColor: "transparent",
            cursor: "pointer",
        };

        return (
            <div>
                {eventType === "edit" && (
                    <button
                        onClick={() => handleDeleteEvent(eventInfo.event)}
                        style={buttonStyle}>
                        <i
                            className="bi bi-x-circle-fill"
                            style={iconStyle}></i>
                    </button>
                )}
                {/*
                <div>
                    {submitted === "submitted" ? "Submitted" : "Not Submitted"}
                </div>
                */}
            </div>
        );
    };

    const renderDayHeaderContent = (headerInfo) => {
        const dayName = headerInfo.date.toLocaleDateString("en-US", {
            weekday: "short",
        });
        const dayNumber = headerInfo.date.getDate();

        const dayNameStyle = {
            fontSize: "16px",
            textTransform: "uppercase",
            fontWeight: 100,
            color: "gray",
            textDecoration: "none",
            fontFamily: "Roboto,Arial,sans-serif",
        };

        const dayNumberStyle = {
            fontSize: "30px",
            fontWeight: 300,
            color: "gray",
            textDecoration: "none",
            fontFamily: "Roboto,Arial,sans-serif",
        };

        return (
            <div>
                <div style={dayNameStyle}>{dayName}</div>
                <div style={dayNumberStyle}>{dayNumber}</div>
            </div>
        );
    };

    const renderResourceLabelContent = (resourceInfo) => {
        const name = resourceInfo.resource.title;
        const id = resourceInfo.resource.id;

        const getInitials = (fullName) => {
            return fullName
                .split(" ")
                .map((word) => word[0])
                .join("");
        };

        const initials = getInitials(name);
        return (
            <div
                style={{
                    fontFamily: "Roboto,Arial,sans-serif",
                    color: colorDict[id],
                }}>
                {initials}
            </div>
        );
    };

    const renderSlotLabelContent = (slotLabelInfo) => {
        const dayNameStyle = {
            fontSize: "10px",
            textTransform: "uppercase",
            fontWeight: 100,
            color: "gray",
            textDecoration: "none",
            fontFamily: "Roboto,Arial,sans-serif",
        };
        return (
            <div style={dayNameStyle}>
                <b>
                    {slotLabelInfo.date.toLocaleTimeString([], {
                        hour: "numeric",
                        omitZeroMinute: true,
                    })}
                </b>
            </div>
        );
    };

    const createTerm = (start_date, end_date) => {
        console.log("Role in createTerm:", role);

        if (role === "admin" || role === "staff") {
            api.post("api/terms/by-user/", {
                user: currUserId,
                start_date,
                end_date,
            })
                .then((res) => {
                    if (res.status === 201) console.log("Term saved!");
                    else alert("Failed to make term.");
                })
                .catch((err) => alert(err));
        } else {
            console.log("Role is not admin or staff");
            api.post("api/terms/", { start_date, end_date })
                .then((res) => {
                    if (res.status === 201) console.log("Term saved!");
                    else alert("Failed to make term.");
                })
                .catch((err) => alert(err));
        }
    };

    const handleSubmit = async () => {
        const eventsString = events
            .map((event) => `Start: ${event.start}, End: ${event.end}`)
            .join("\n");
        const isConfirmed = window.confirm(
            `Submitting these terms:\n${eventsString}\nDo you want to proceed?`
        );
        if (!isConfirmed) return;
        if (role === "admin" || role === "staff") {
            api.delete(`api/terms/delete-all/user/${currUserId}/`).then(
                (res) => {
                    if (res.status === 204) {
                        console.log("All terms deleted!");
                    }
                    events
                        .filter((event) => event.type === "edit")
                        .map((event) => {
                            createTerm(event.start, event.end);
                        });
                }
            );
        } else if (role === "player") {
            api.delete(`api/terms/delete-all/`)
                .then((res) => {
                    if (res.status === 204) {
                        console.log("All terms deleted!");
                        events
                            .filter((event) => event.type === "edit")
                            .map((event) => {
                                createTerm(event.start, event.end);
                            });
                    } else {
                        alert("Failed to delete terms.");
                    }
                })
                .catch((error) => alert(error));
        }
    };
    const handleSelectChange = (event) => {
        setCurrUserId(parseInt(event.target.value));
        // Add your custom logic here
        console.log(`Selected player: ${event.target.value}`);
    };

    useEffect(() => {
        console.log("I AM IN USEEFFECT");
        setRerenderKey((prevKey) => prevKey + 1);
        events.forEach((event) => {
            if (event.player_id === currUserId) {
                event.type = "edit";
                event.backgroundColor = hexToRgba(
                    colorDict[event.player_id],
                    1
                );
            } else {
                event.type = "show";
                event.backgroundColor = hexToRgba(
                    colorDict[event.player_id],
                    0.3
                );
            }
        });
    }, [currUserId]);

    return (
        <div>
            <div className="container mt-3 mb-3">
                <div className="row">
                    <div
                        className={playerList.length > 1 ? "col-10" : "col-12"}>
                        <FullCalendar
                            key={rerenderKey}
                            titleFormat={{
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            }}
                            views={{
                                resourceTimeGridWeek: {
                                    type: "resourceTimeGrid",
                                    duration: { days: 7 },
                                },
                            }}
                            datesAboveResources={true}
                            nowIndicator={true}
                            dayHeaderFormat={{
                                weekday: "long",
                                meridiem: "long",
                            }}
                            plugins={[
                                resourceTimelinePlugin,
                                adaptivePlugin,
                                resourceTimeGridPlugin,
                                dayGridPlugin,
                                interactionPlugin,
                                listPlugin,
                                rrulePlugin,
                            ]}
                            initialView="resourceTimeGridWeek" // Change this to resourceTimeGridWeek
                            slotDuration="00:30:00"
                            slotMinTime={"08:00:00"}
                            slotMaxTime={"21:00:00"}
                            resourceAreaWidth="10%"
                            resources={resources}
                            resourceAreaHeaderContent="Players"
                            events={events}
                            contentHeight={"auto"}
                            selectable={true} // Enable slot selection
                            select={handleSelectSlot}
                            selectAllow={selectAllow}
                            eventContent={renderEventContent} // Custom event rendering
                            dayHeaderContent={renderDayHeaderContent} // Custom day header rendering
                            resourceLabelContent={renderResourceLabelContent} // Custom resource label rendering
                            slotLabelContent={renderSlotLabelContent}
                            timeZone="local"
                            headerToolbar={{
                                left: "prev,next today",
                                center: "",
                                right: "title",
                            }}
                            buttonIcons={{
                                prev: "chevron-left",
                                next: "chevron-right",
                            }}
                            buttonText={{
                                today: "Today",
                                week: "Weekly",
                            }}
                            schedulerLicenseKey="CC-Attribution-NonCommercial-NoDerivatives"
                        />
                        <div className="row">
                            <div className="col-12 text-center mt-3 mb-3">
                                <button
                                    className="btn btn-primary"
                                    onClick={handleSubmit}>
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                    {playerList.length > 1 && (
                        <div className="col-2"  style={{ marginTop: "60px" }}>
                            <small>You are currently editing:</small>
                            <select
                                className="form-select"
                               
                                value={currUserId}
                                onChange={handleSelectChange}>
                                <option value="all">Select player</option>
                                {playerList.map((player) => (
                                    <option
                                        key={player.user}
                                        value={player.user}>
                                        {player.name} {player.surname}
                                    </option>
                                ))}
                            </select>
                            <UserColorSquare
                                currUserId={currUserId}
                                playerList={playerList}
                                colorDict={colorDict}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CalendarResource;
