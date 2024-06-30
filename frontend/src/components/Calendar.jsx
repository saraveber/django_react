import React, { useEffect, useState } from 'react';
import '../styles/Calendar.css';
import api from "../api";

const Calendar = ({ CurrUserId ,role}) => {
  const [coloredCells, setColoredCells] = useState({}); // State for colored cells
  const [isDragging, setIsDragging] = useState(false); // State to track dragging
  const [dragStart, setDragStart] = useState(null); // State for drag start
  const [dragEnd, setDragEnd] = useState(null); // State for drag end
  const [currentWeek, setCurrentWeek] = useState(new Date()); // State for current week
  const [savedTerms, setSavedTerms] = useState([]); // State for saved timestamps
  const [savedTermsRaw, setSavedTermsRaw] = useState([]); // State for saved timestamps

  // Example logic to set colored cells based on saved timestamps
  useEffect(() => {   
    getTerms();
  }, [CurrUserId]);


  // Function to read which cells are saved in db
  const getTerms = () => { 
    // Example API call
    setColoredCells({});
    console.log("Getting terms...");
    api
      .get("api/terms/user/" + CurrUserId + "/")
      .then((res) => res.data)
      .then((data) => {
        data.forEach((term) => {
          const date = new Date(term.start_date);
          const formated_hour = date.getHours().toString().padStart(2, '0') + ":00";
          // Empty colored cells
          

          initialColoredCells(date.getDate(), date.toLocaleString('en-US', { month: 'long' }), date.getFullYear(), formated_hour);
        });
      })
      .catch((err) => alert(err));
  };

  const initialColoredCells = (date, month, year, hour) => {

    console.log("Setting initial colored cells...");
    const cellKey = `${date}-${month}-${year}-${hour}`;

    setColoredCells((prevState) => ({
      ...prevState,
      [cellKey]: true, // Toggle color
    }));
  };
  



  // Helper function to filter out past cells
  const filterPastCells = (cells) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Set to start of today for comparison

    return Object.keys(cells).reduce((result, key) => {
      const [date, month, year, hour] = key.split('-');
      const cellDate = new Date(year, new Date(`${month} 1, ${year}`).getMonth(), date, hour.split(':')[0], 0);

      if (cellDate >= now) {
        result[key] = cells[key];
      }

      return result;
    }, {});
  };

  // Function to handle cell click
  const handleCellClick = (date, month, year, hour) => {
    console.log("Clicking cell...")
    if (!isDragging) {
      const cellKey = `${date}-${month}-${year}-${hour}`;

      setColoredCells((prevState) => {
        const newState = { ...prevState, [cellKey]: !prevState[cellKey] }; // Toggle color
        return filterPastCells(newState); // Filter out past cells
      });
    }
  };

  // Function to handle mouse down on cell
  const handleMouseDown = (date, month, year, hour) => {
    setIsDragging(true);
    setDragStart({ date, month, year, hour });
    setDragEnd(null);
  };

  // Function to handle mouse enter on cell (during dragging)
  const handleMouseEnter = (date, month, year, hour) => {
    if (isDragging) {
      setDragEnd({ date, month, year, hour });
    }
  };

  // Function to handle mouse up (end of dragging)
  const handleMouseUp = () => {
    if (dragStart && dragEnd) {
      const updatedCells = { ...coloredCells };
      const startDate = dragStart.date;
      const endDate = dragEnd.date;
      const startHour = parseInt(dragStart.hour.split(':')[0], 10);
      const endHour = parseInt(dragEnd.hour.split(':')[0], 10);

      for (let date = Math.min(startDate, endDate); date <= Math.max(startDate, endDate); date++) {
        for (let hour = Math.min(startHour, endHour); hour <= Math.max(startHour, endHour); hour++) {
          const cellKey = `${date}-${dragStart.month}-${dragStart.year}-${hour.toString().padStart(2, '0')}:00`;
          updatedCells[cellKey] = !updatedCells[cellKey]; // Toggle color
        }
      }
      setColoredCells(filterPastCells(updatedCells)); // Update state with new colored cells and filter past cells
    }
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  };

  // Function to determine if a cell is within the drag area
  const isWithinDragArea = (date, month, year, hour) => {
    if (!dragStart || !dragEnd) return false;

    const startDate = dragStart.date;
    const endDate = dragEnd.date;
    const currentDate = date;
    const startHour = parseInt(dragStart.hour.split(':')[0], 10);
    const endHour = parseInt(dragEnd.hour.split(':')[0], 10);
    const currentHour = parseInt(hour.split(':')[0], 10);

    const withinDays = currentDate >= Math.min(startDate, endDate) && currentDate <= Math.max(startDate, endDate);
    const withinHours = currentHour >= Math.min(startHour, endHour) && currentHour <= Math.max(startHour, endHour);

    return withinDays && withinHours;
  };


  // Function to create a term
  const createTerm = (start_date, end_date) => {
    console.log("Role in createTerm:", role);
    if (role === "admin" || role === "staff") {
      api
        .post("api/terms/by-user/", { user: CurrUserId, start_date, end_date })
        .then((res) => {
          if (res.status === 201) console.log("Term saved!");
          else alert("Failed to make term.");
        }
        )
        .catch((err) => alert(err));
    }else{
      console.log("Role is not admin or staff");
      api
        .post("api/terms/", {start_date, end_date })
        .then((res) => {
          if (res.status === 201) console.log("Term saved!");
          else alert("Failed to make term.");
        }
        )
        .catch((err) => alert(err));
    }

  };

  // Function to delete all terms for user
  const deleteAllTermsThenCreate = (selectedTimestamps) => {
    console.log("Role in createTerm:", role);
    console.log(role === "admin" || role === "staff")
    if (role === "admin" || role === "staff") {
      api.delete(`api/terms/delete-all/user/${CurrUserId}/`)
        .then((res) => {
          if (res.status === 204) {
            console.log("All terms deleted!");

            // After successful deletion, create the new term
            selectedTimestamps.map((date) => {
              createTerm(date, date);
            });

          } else {
            alert("Failed to delete terms.");
          }
        })
        .catch((error) => alert(error));
    }else{
      api.delete(`api/terms/delete-all/`)
        .then((res) => {
          if (res.status === 204) {
            console.log("All terms deleted!");

            // After successful deletion, create the new term
            selectedTimestamps.map((date) => {
              createTerm(date, date);
            });

          } else {
            alert("Failed to delete terms.");
          }
        })
        .catch((error) => alert(error));
    }
  };


  // Function to handle form submission
  const handleSubmit = () => {
    console.log("Submitting form...");
    // Save all collored cells
    
    
    // Create terms in correct format
    const selectedTimestamps = Object.keys(coloredCells)
      .filter((key) => coloredCells[key]) // Filter only colored cells
      .map((cellKey) => {
        // Extract date, month, year, and hour from cellKey
        const [date, month, year, hour] = cellKey.split('-');

        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
          ];
        
        return new Date(year,monthNames.indexOf(month),date,hour.split(":")[0],0)
    });
    // Empty database and add new terms
    deleteAllTermsThenCreate(selectedTimestamps);
   };

  // Function to navigate to the previous week
  const handlePreviousWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(currentWeek.getDate() - 7);

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to start of day for comparison

    if (newDate >= today) {
      setCurrentWeek(newDate);
    }
  };

  // Function to navigate to the next week
  const handleNextWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(currentWeek.getDate() + 7);
    setCurrentWeek(newDate);
  };

  // Function to navigate to the current week
  const handleToday = () => {
    setCurrentWeek(new Date());
  };

  // Generate hours from 07:00 to 22:00 (7 AM to 10 PM)
  const hours = Array.from({ length: 16 }, (_, i) => {
    const hour = i + 7;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  // Dates for each day of the week starting from Monday
  const startDate = new Date(currentWeek);
  startDate.setDate(startDate.getDate() - startDate.getDay() + (startDate.getDay() === 0 ? -6 : 1)); // Set to Monday of the current week

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    return {
      name: date.toLocaleString('en-US', { weekday: 'long' }),
      date: date.getDate(),
      month: date.toLocaleString('en-US', { month: 'long' }),
      year: date.getFullYear(), // Get the year
    };
  });

  // Determine if the current week is the same as this week
  const isCurrentWeek = new Date().toDateString() === currentWeek.toDateString();

  return  (
    <div className="calendar-container">
      <div className="navigation-buttons">
        <button className={`change-week ${isCurrentWeek ? 'hidden' : ''}`} onClick={handlePreviousWeek}>&lt;</button>
        <button className={`today-button ${isCurrentWeek ? 'hidden' : ''}`} onClick={handleToday}>Danes</button>
        <button className="change-week" onClick={handleNextWeek}>&gt;</button>
      </div>
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
                    key={`${day.date}-${day.month}-${day.year}-${hour}`}
                    className={`cell ${coloredCells[`${day.date}-${day.month}-${day.year}-${hour}`] ? 'colored' : ''} ${isDragging && isWithinDragArea(day.date, day.month, day.year, hour) ? 'dragged' : ''}`}
                    onMouseDown={() => handleMouseDown(day.date, day.month, day.year, hour)}
                    onMouseEnter={() => handleMouseEnter(day.date, day.month, day.year, hour)}
                    onClick={() => handleCellClick(day.date, day.month, day.year, hour)}
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
