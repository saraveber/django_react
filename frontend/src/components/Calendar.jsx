import React, { useState } from 'react';
import '../Calendar.css';

const Calendar = () => {
  const [coloredCells, setColoredCells] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);

  const handleCellClick = (day, hour) => {
    if (!isDragging) {
      const cellKey = `${day}-${hour}`;
      setColoredCells((prevState) => ({
        ...prevState,
        [cellKey]: !prevState[cellKey],
      }));
    }
  };

  const handleMouseDown = (day, hour) => {
    setIsDragging(true);
    setDragStart({ day, hour });
    setDragEnd(null);
  };

  const handleMouseEnter = (day, hour) => {
    if (isDragging) {
      setDragEnd({ day, hour });
    }
  };

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
          updatedCells[cellKey] = !updatedCells[cellKey];
        }
      }
      setColoredCells(updatedCells);
    }
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  };

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

  // Generate hours from 07:00 to 22:00 (7 AM to 10 PM)
  const hours = Array.from({ length: 16 }, (_, i) => {
    const hour = i + 7;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="calendar">
      <table
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <thead>
          <tr>
            <th className="hour-header"></th>
            {days.map((day) => (
              <th key={day} className="day-header">{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hours.map((hour) => (
            <tr key={hour}>
              <td className="hour">{hour}</td>
              {days.map((day) => (
                <td
                  key={`${day}-${hour}`}
                  className={`cell ${coloredCells[`${day}-${hour}`] ? 'colored' : ''} ${isDragging && isWithinDragArea(day, hour) ? 'dragged' : ''}`}
                  onMouseDown={() => handleMouseDown(day, hour)}
                  onMouseEnter={() => handleMouseEnter(day, hour)}
                  onClick={() => handleCellClick(day, hour)}
                >
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Calendar;
