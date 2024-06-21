import React, { useState } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './TimesheetForm.css';

const TimesheetForm = () => {
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [startHour, setStartHour] = useState('');
    const [endHour, setEndHour] = useState('');
    const [activity, setActivity] = useState('');
    const [remarks, setRemarks] = useState('');
    const [entries, setEntries] = useState([]);

    const addEntry = () => {
        const newEntry = { date, start_hour: startHour, end_hour: endHour, activity, remarks };
        setEntries([...entries, newEntry]);
        setDate('');
        setStartHour('');
        setEndHour('');
        setActivity('');
        setRemarks('');
    };

    const removeEntry = (index) => {
        const newEntries = [...entries];
        newEntries.splice(index, 1);
        setEntries(newEntries);
    };

    const submitTimesheet = () => {
        const data = { name, entries };
        axios.post('http://localhost:5000/submit_timesheet', data)
            .then(response => alert(response.data.message))
            .catch(error => console.error('There was an error submitting the timesheet!', error));
    };

    const downloadPDF = () => {
        const data = { name, entries };
        axios.post('http://localhost:5000/download_pdf', data, { responseType: 'blob' })
            .then(response => {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'timesheet.pdf');
                document.body.appendChild(link);
                link.click();
            })
            .catch(error => console.error('There was an error downloading the PDF!', error));
    };

    const onDragEnd = (result) => {
        if (!result.destination) {
            return;
        }

        const newEntries = Array.from(entries);
        const [movedEntry] = newEntries.splice(result.source.index, 1);
        newEntries.splice(result.destination.index, 0, movedEntry);
        setEntries(newEntries);
    };

    return (
        <div className='timesheet-form'>
            <h1>Timesheet Form</h1>
            <div>
                <label>Name:</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
                <label>Date:</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                <label>Start Hour:</label>
                <input type="time" value={startHour} onChange={(e) => setStartHour(e.target.value)} />
                <label>End Hour:</label>
                <input type="time" value={endHour} onChange={(e) => setEndHour(e.target.value)} />
                <label>Activity:</label>
                <input type="text" value={activity} onChange={(e) => setActivity(e.target.value)} />
                <label>Remarks:</label>
                <input type="text" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                <button onClick={addEntry}>Add Entry</button>
            </div>
            <h2>Entries</h2>
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="droppable-entries">
                    {(provided) => (
                        <table {...provided.droppableProps} ref={provided.innerRef}>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Start Hour</th>
                                    <th>End Hour</th>
                                    <th>Activity</th>
                                    <th>Remarks</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entries.map((entry, index) => (
                                    <Draggable key={index} draggableId={`entry-${index}`} index={index}>
                                        {(provided, snapshot) => (
                                            <tr
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className={`draggable-item ${snapshot.isDragging ? 'dragging' : ''}`}
                                            >
                                                <td>{entry.date}</td>
                                                <td>{entry.start_hour}</td>
                                                <td>{entry.end_hour}</td>
                                                <td>{entry.activity}</td>
                                                <td>{entry.remarks}</td>
                                                <td>
                                                    <button onClick={() => removeEntry(index)}>Delete</button>
                                                </td>
                                            </tr>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </tbody>
                        </table>
                    )}
                </Droppable>
            </DragDropContext>
            <button onClick={submitTimesheet}>Submit Timesheet</button>
            <button onClick={downloadPDF}>Download PDF</button>
        </div>
    );
};

export default TimesheetForm;
