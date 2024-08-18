// renderFunctions.js
import React from "react";
import { hexToRgba } from "./calanderUtils";

export const renderEventContent = (eventInfo, currUserId, colorDict, handleDeleteEvent) => {
    const eventType = eventInfo.event.extendedProps.type;
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
        </div>
    );
};

export const renderDayHeaderContent = (headerInfo) => {
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

export const renderResourceLabelContent = (resourceInfo, colorDict) => {
    const name = resourceInfo.resource.title;
    const id = resourceInfo.resource.id;

    const getInitials = (fullName) => {
        const names = fullName.split(" ");
        const initials = names.map((name) => name.charAt(0).toUpperCase());
        return initials.join("");
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

export const renderSlotLabelContent = (slotLabelInfo) => {
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