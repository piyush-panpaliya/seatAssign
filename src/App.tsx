import React, { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import Papa from 'papaparse'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Student {
  name: string
  id: string
}

interface Seat {
  id: string
  section: string
  row: number
  number: number
  student: Student | null
}

const TheaterSeating: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([])
  const [seats, setSeats] = useState<Seat[]>([])
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  // Initialize seats
  useEffect(() => {
    const sections = ['A', 'B', 'C', 'D', 'E', 'F']
    const initialSeats: Seat[] = []
    sections.forEach((section) => {
      for (let row = 1; row <= 10; row++) {
        for (let number = 1; number <= 11; number++) {
          initialSeats.push({
            id: `${section}${row}-${number}`,
            section,
            row,
            number,
            student: null
          })
        }
      }
    })
    setSeats(initialSeats)
  }, [])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    Papa.parse(file, {
      complete: (result) => {
        const parsedStudents: Student[] = result.data
          .filter((row: any) => row.name && row.id)
          .map((row: any) => ({ name: row.name, id: row.id }))
        setStudents(parsedStudents)
      },
      header: true
    })
  }, [])

  const { getRootProps, getInputProps } = useDropzone({ onDrop })

  const assignRandomSeats = () => {
    const shuffledStudents = [...students].sort(() => 0.5 - Math.random())
    const newSeats = seats.map((seat, index) => ({
      ...seat,
      student: index < shuffledStudents.length ? shuffledStudents[index] : null
    }))
    setSeats(newSeats)
  }

  const handleSeatClick = (seat: Seat) => {
    setSelectedSeat(seat)
    setSelectedStudent(seat.student)
  }

  const handleStudentAssignment = () => {
    if (selectedSeat && selectedStudent) {
      const newSeats = seats.map((seat) =>
        seat.id === selectedSeat.id
          ? { ...seat, student: selectedStudent }
          : seat
      )
      setSeats(newSeats)
      setSelectedSeat(null)
      setSelectedStudent(null)
    }
  }

  const handleStudentRemoval = () => {
    if (selectedSeat) {
      const newSeats = seats.map((seat) =>
        seat.id === selectedSeat.id ? { ...seat, student: null } : seat
      )
      setSeats(newSeats)
      setSelectedSeat(null)
      setSelectedStudent(null)
    }
  }

  const renderSection = (section: string) => {
    const sectionSeats = seats.filter((seat) => seat.section === section)
    return (
      <div key={section} className='m-2 p-2 border rounded'>
        <h3 className='text-lg font-bold mb-2'>Section {section}</h3>
        <div className='grid grid-cols-11 gap-1'>
          {sectionSeats.map((seat) => (
            <div
              key={seat.id}
              className={`cursor-pointer p-1 text-center text-xs ${
                seat.student ? 'bg-blue-200' : 'bg-gray-200'
              } ${selectedSeat?.id === seat.id ? 'ring-2 ring-red-500' : ''}`}
              onClick={() => handleSeatClick(seat)}
            >
              {seat.number}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>Theater Seating Arrangement</h1>

      <div
        {...getRootProps()}
        className='border-2 border-dashed border-gray-300 p-4 mb-4'
      >
        <input {...getInputProps()} />
        <p>Drag 'n' drop a CSV file here, or click to select one</p>
      </div>

      <Button onClick={assignRandomSeats} className='mb-4'>
        Assign Random Seats
      </Button>

      <div className='mb-4 text-center font-bold'>SCREEN</div>

      <div className='grid grid-cols-3 gap-4 mb-4'>
        {renderSection('A')}
        {renderSection('B')}
        {renderSection('C')}
      </div>
      <div className='grid grid-cols-3 gap-4 mb-4'>
        {renderSection('D')}
        {renderSection('E')}
        {renderSection('F')}
      </div>

      <div className='text-center mb-4'>
        <span className='inline-block transform rotate-180'>▲</span> Entrance
      </div>

      {selectedSeat && (
        <div className='mb-4'>
          <h2 className='text-xl font-bold mb-2'>
            Selected Seat: {selectedSeat.section}
            {selectedSeat.row}-{selectedSeat.number}
          </h2>
          <Label htmlFor='studentSelect'>Select Student:</Label>
          <Input
            id='studentSelect'
            as='select'
            value={selectedStudent?.id || ''}
            onChange={(e) =>
              setSelectedStudent(
                students.find((s) => s.id === e.target.value) || null
              )
            }
            className='mb-2'
          >
            <option value=''>Select a student</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </Input>
          <Button onClick={handleStudentAssignment} className='mr-2'>
            Assign Student
          </Button>
          <Button onClick={handleStudentRemoval} variant='destructive'>
            Remove Student
          </Button>
        </div>
      )}
    </div>
  )
}

export default TheaterSeating
