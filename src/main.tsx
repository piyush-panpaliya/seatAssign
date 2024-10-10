import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

import { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

// Define types for our data structures
type Student = {
  id: string
  name: string
  rollNo: string
}

type Seat = {
  id: string
  studentId: string | null
}

const initialStudents: Student[] = [
  { id: 's1', name: 'Alice', rollNo: '001' },
  { id: 's2', name: 'Bob', rollNo: '002' },
  { id: 's3', name: 'Charlie', rollNo: '003' },
  { id: 's4', name: 'David', rollNo: '004' },
  { id: 's5', name: 'Eve', rollNo: '005' }
]

const initialSeats: Seat[] = Array.from({ length: 20 }, (_, i) => ({
  id: `seat-${i + 1}`,
  studentId: null
}))

function Component() {
  const [students] = useState<Student[]>(initialStudents)
  const [seats, setSeats] = useState<Seat[]>(initialSeats)

  const onDragEnd = (result: any) => {
    if (!result.destination) return

    const { source, destination } = result

    if (
      source.droppableId === 'studentList' &&
      destination.droppableId === 'seatMap'
    ) {
      const studentId = result.draggableId
      const seatId = destination.droppableId.split('-')[1]

      setSeats((prevSeats) =>
        prevSeats.map((seat) =>
          seat.id === seatId ? { ...seat, studentId } : seat
        )
      )
    }
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className='flex w-screen flex-col md:flex-row h-screen'>
        <div className='grow  p-4 bg-gray-100'>
          <h2 className='text-2xl font-bold mb-4'>Seat Map</h2>
          <Droppable droppableId='seatMap'>
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className='grid grid-cols-4 gap-4'
              >
                {seats.map((seat, index) => (
                  <Droppable key={seat.id} droppableId={`seat-${seat.id}`}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className='bg-white p-2 rounded shadow'
                      >
                        <div className='font-bold'>Seat {index + 1}</div>
                        {seat.studentId && (
                          <div className='text-sm'>
                            {
                              students.find((s) => s.id === seat.studentId)
                                ?.name
                            }
                          </div>
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                ))}
              </div>
            )}
          </Droppable>
        </div>
        <div className='md:w-1/3 p-4 bg-gray-200'>
          <h2 className='text-2xl font-bold mb-4'>Student List</h2>
          <Droppable droppableId='studentList'>
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {students.map((student, index) => (
                  <Draggable
                    key={student.id}
                    draggableId={student.id}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className='bg-white p-2 mb-2 rounded shadow'
                      >
                        <div className='font-bold'>{student.name}</div>
                        <div className='text-sm'>Roll No: {student.rollNo}</div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </div>
    </DragDropContext>
  )
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
