import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Papa from 'papaparse'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { sections } from './lib/seats'

interface Student {
  name: string
  id: string
}
interface Seat {
  id: string
  section: string
  row: string
  student: Student | null
  blocked: boolean
}

const getSeats = (sectionList: typeof sections) => {
  return sectionList.reduce((acc, curr) => {
    const secSeats = curr.rows.map((row) => {
      return Array.from(
        { length: row.end - row.start + 1 },
        (_, i) => row.start + i
      ).map((id, i) => ({
        id: `${row.row}${id}`,
        section: curr.section,
        row: row.row,
        student: null,
        blocked: i % 2 === 0
      }))
    })
    acc.push(...secSeats.flat())
    return acc
  }, [] as Seat[])
}
const Seat = ({
  seat,
  selected,
  onClick
}: {
  seat: Seat
  selected: boolean
  onClick: (seat: Seat) => void
}) => {
  return (
    <button
      className={`bg-white-50 m-0.5 w-8 cursor-pointer border border-gray-400 px-1 py-1 text-center text-[8px] ${
        selected
          ? 'bg-green-600'
          : seat.blocked
          ? 'bg-gray-300'
          : seat.student
          ? 'bg-red-400'
          : ''
      }`}
      // className={cn(
      //   'bg-white-50 m-0.5 w-8 cursor-pointer border border-gray-400 px-1 py-1 text-center text-[8px]',
      //   selected && 'bg-green-600',

      // )}
      onClick={() => onClick(seat)}
      disabled={seat.blocked}
    >
      {seat.id}
    </button>
  )
}

const RenderSection = ({
  section,
  seats,
  handleSeatClick,
  selectedSeat
}: {
  section: string
  seats: Seat[]
  selectedSeat: Seat | null
  handleSeatClick: (seat: Seat) => void
}) => {
  const sectionSeats = seats
    .filter((seat) => seat.section === section)
    .reduce((acc, curr) => {
      const existingRow = acc.find((item) => item.row === curr.row)

      if (existingRow) {
        existingRow.seats.push(curr)
      } else {
        acc.push({ row: curr.row, seats: [curr] })
      }

      return acc
    }, [] as { row: string; seats: Seat[] }[])
  if (!sectionSeats.length) return 'Error'
  console.log(section, 'loading...')
  return (
    <div
      key={section}
      className='p-2 border rounded flex flex-col items-center gap-2'
    >
      <p className='text-lg font-bold'>Section {section}</p>
      <div className='flex flex-col items-center gap-1'>
        {sectionSeats.map((row) => (
          <div
            key={row.row}
            className='flex flex-row-reverse items-center justify-center gap-x-1'
          >
            {row.seats.map((seat) => (
              <Seat
                key={seat.id}
                onClick={handleSeatClick}
                selected={selectedSeat?.id === seat.id}
                seat={seat}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

const Seating = () => {
  const [students, setStudents] = useState<Student[]>([])
  const [seats, setSeats] = useState<Seat[]>(getSeats(sections))
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    Papa.parse(file, {
      complete: (result) => {
        const filteredStudents = result.data.filter(
          // eslint-disable-next-line
          (row: any) => row.name && row.roll_no
        ) as Student[]
        const parsedStudents = filteredStudents.map((row: Student) => ({
          name: row.name,
          id: row.id
        }))
        setStudents(parsedStudents)
      },
      header: true
    })
    console.log(students)
  }, [])

  const { getRootProps, getInputProps } = useDropzone({ onDrop })

  const assignRandomSeats = () => {
    const shuffledStudents = [...students].sort(() => 0.5 - Math.random())
    const newSeats = seats.map((seat, index) => ({
      ...seat,
      student:
        index < shuffledStudents.length && !seat.blocked
          ? shuffledStudents[index]
          : null
    }))
    setSeats(newSeats)
  }

  const handleSeatClick = (seat: Seat) => {
    if (seat.id === selectedSeat?.id) {
      setSelectedSeat(null)
      return
    }
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

  return (
    <div className='max-w-screen flex justify-between'>
      <div className='h-screen grow flex flex-col items-start'>
        <p className='text-2xl font-bold mb-4'>Seating Arrangement</p>
        <div className='overflow-auto flex flex-col items-center'>
          <p className='mb-4 text-center font-bold'>SCREEN</p>
          <div className='grid grid-cols-3 gap-4 mb-4 w-max'>
            <RenderSection
              selectedSeat={selectedSeat}
              section='C'
              seats={seats.filter((s) => s.section === 'C')}
              handleSeatClick={handleSeatClick}
            />
            <RenderSection
              selectedSeat={selectedSeat}
              section='B'
              handleSeatClick={handleSeatClick}
              seats={seats.filter((s) => s.section === 'B')}
            />
            <RenderSection
              selectedSeat={selectedSeat}
              handleSeatClick={handleSeatClick}
              section='A'
              seats={seats.filter((s) => s.section === 'A')}
            />
          </div>
          <div className='grid grid-cols-3 gap-4 mb-4 w-max'>
            <RenderSection
              selectedSeat={selectedSeat}
              handleSeatClick={handleSeatClick}
              section='F'
              seats={seats.filter((s) => s.section === 'F')}
            />
            <RenderSection
              selectedSeat={selectedSeat}
              handleSeatClick={handleSeatClick}
              section='E'
              seats={seats.filter((s) => s.section === 'E')}
            />
            <RenderSection
              selectedSeat={selectedSeat}
              handleSeatClick={handleSeatClick}
              section='D'
              seats={seats.filter((s) => s.section === 'D')}
            />
          </div>
          <p className='text-center mb-4'>Entrance</p>
        </div>
      </div>
      <div className='flex flex-col md:w-1/3 p-4'>
        <div
          {...getRootProps()}
          className='border-2 border-dashed border-gray-300 p-4 mb-4'
        >
          <input {...getInputProps()} />
          <p className='cursor-pointer'>
            Drag 'n' drop a CSV file here, or click to select one
          </p>
        </div>

        <Button onClick={assignRandomSeats} className='mb-4'>
          Assign Random Seats
        </Button>
        {selectedSeat && (
          <div className='mb-4'>
            <h2 className='text-xl font-bold mb-2'>
              Selected Seat: {selectedSeat.section}
              {selectedSeat.id}
            </h2>
            <Label htmlFor='studentSelect'>Select Student:</Label>
            <select
              id='studentSelect'
              // as='select'
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
            </select>
            <Button onClick={handleStudentAssignment} className='mr-2'>
              Assign Student
            </Button>
            <Button onClick={handleStudentRemoval} variant='destructive'>
              Remove Student
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Seating
