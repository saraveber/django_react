import React, { useState } from 'react';
import '../Calendar.css';

const Calendar = () => {
  const [coloredCells, setColoredCells] = useState({}); // State for colored cells
  const [isDragging, setIsDragging] = useState(false); // State to track dragging
  const [dragStart, setDragStart] = useState(null); // State for drag start
  const [dragEnd, setDragEnd] = useState(null); // State for drag end

  // Function to handle cell click
  const handleCellClick = (day, hour) => {
    if (!isDragging) {
      const cellKey = `${day}-${hour}`;
      setColoredCells((prevState) => ({
        ...prevState,
        [cellKey]: !prevState[cellKey], // Toggle color
      }));
    }
  };

  // Function to handle mouse down on cell
  const handleMouseDown = (day, hour) => {
    setIsDragging(true);
    setDragStart({ day, hour });
    setDragEnd(null);
  };

  // Function to handle mouse enter on cell (during dragging)
  const handleMouseEnter = (day, hour) => {
    if (isDragging) {
      setDragEnd({ day, hour });
    }
  };

  // Function to handle mouse up (end of dragging)
  const handleMouseUp = () => {
    if (dragStart && dragEnd) {
      const updatedCells = { ...coloredCells };
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const startDayIndex = days.indexOf(dragStart.day);
      const endDayIndex = days.indexOf(dragEnd.day);
      const startHour = parseInt(dragStart.hour.split(':')[0], 10);
      const endHour = parseInt(dragEnd.hour.split(':')[0], 10);

      for (let dayIndex = Math.min(startDayIndex, endDayIndex); dayIndex <= Math.max(startDayIndex, endDayIndex); dayIndex++) {
        for (let hour = Math.min(startHour, endHour); hour <= Math.max(startHour, endHour); hour++) {
          const cellKey = `${days[dayIndex]}-${hour.toString().padStart(2, '0')}:00`;
          updatedCells[cellKey] = !updatedCells[cellKey]; // Toggle color
        }
      }
      setColoredCells(updatedCells); // Update state with new colored cells
    }
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  };

  // Function to determine if a cell is within the drag area
  const isWithinDragArea = (day, hour) => {
    if (!dragStart || !dragEnd) return false;

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const startDayIndex = days.indexOf(dragStart.day);
    const endDayIndex = days.indexOf(dragEnd.day);
    const currentDayIndex = days.indexOf(day);
    const startHour = parseInt(dragStart.hour.split(':')[0], 10);
    const endHour = parseInt(dragEnd.hour.split(':')[0], 10);
    const currentHour = parseInt(hour.split(':')[0], 10);

    const withinDays = currentDayIndex >= Math.min(startDayIndex, endDayIndex) && currentDayIndex <= Math.max(startDayIndex, endDayIndex);
    const withinHours = currentHour >= Math.min(startHour, endHour) && currentHour <= Math.max(startHour, endHour);

    return withinDays && withinHours;
  };

  // Function to handle form submission
  const handleSubmit = () => {
    const selectedTimestamps = Object.keys(coloredCells)
      .filter((key) => coloredCells[key]) // Filter only colored cells
      .map((cellKey) => {
        // Extract day and hour from cellKey

        const [day, hour] = cellKey.split('-');
        // Return timestamp format 'DD.MM.YYYY HH:00'
        return `${day}.${new Date().toLocaleString('default', { month: 'numeric' }).padStart(2, '0')}.${new Date().getFullYear()} ${hour}:00`;
      });

    console.log('Selected Timestamps:', selectedTimestamps);
    // Example submission logic
    alert('Submitted!');
    // You can add further logic here to send `coloredCells` data to your backend or perform other actions
  };

  // Generate hours from 07:00 to 22:00 (7 AM to 10 PM)
  const hours = Array.from({ length: 16 }, (_, i) => {
    const hour = i + 7;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  // Dates for each day of the week starting from Monday
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - startDate.getDay() + (startDate.getDay() === 0 ? -6 : 1)); // Set to Monday of the current week

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    return {
      name: date.toLocaleString('en-US', { weekday: 'long' }),
      date: date.getDate(),
      month: date.toLocaleString('en-US', { month: 'long' }),
    };
  });

  return (
    <div className="calendar-container">
      <div className="calendar">
        <table
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <thead>
            <tr>
              <th className="hour-header"></th>
              {days.map((day, index) => (
                <th key={index} className="day-header">
                  <div>{day.name}</div>
                  <div>{day.date}. {day.month}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hours.map((hour) => (
              <tr key={hour}>
                <td className="hour">{hour}</td>
                {days.map((day) => (
                  <td
                    key={`${day.name}-${hour}`}
                    className={`cell ${coloredCells[`${day.name}-${hour}`] ? 'colored' : ''} ${isDragging && isWithinDragArea(day.name, hour) ? 'dragged' : ''}`}
                    onMouseDown={() => handleMouseDown(day.name, hour)}
                    onMouseEnter={() => handleMouseEnter(day.name, hour)}
                    onClick={() => handleCellClick(day.name, hour)}
                  >
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="submit-container">
        <button className="submit-button" onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  );
};

export default Calendar;
