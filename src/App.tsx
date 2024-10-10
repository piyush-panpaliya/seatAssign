import { useState, useCallback, useMemo, memo } from 'react'
import { useDropzone } from 'react-dropzone'
import Papa from 'papaparse'
import { Button } from '@/components/ui/button'
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

const SeatComponent = ({
  seat,
  selected,
  onClick
}: {
  seat: Seat
  selected: boolean
  onClick: (seat: Seat) => void
}) => (
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
    onClick={() => onClick(seat)}
    disabled={seat.blocked}
  >
    {seat.id}
  </button>
)

const RenderSection = memo(
  ({
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
                <SeatComponent
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
  },
  (prevProps, nextProps) =>
    prevProps.seats === nextProps.seats &&
    prevProps.selectedSeat?.id === nextProps.selectedSeat?.id
)

const FileDrop = ({ onDrop }: { onDrop: (files: File[]) => void }) => {
  const [fileName, setFileName] = useState<string | null>(null)
  const handleDrop = (acceptedFiles: File[]) => {
    setFileName(acceptedFiles[0]?.name || '')
    onDrop(acceptedFiles)
  }
  const { getRootProps, getInputProps } = useDropzone({ onDrop: handleDrop })
  return (
    <div
      {...getRootProps()}
      className='border-2 border-dashed border-gray-300 p-4 mb-4'
    >
      <input {...getInputProps()} />
      {fileName ? (
        <p className='text-md text-gray-600'>{fileName}</p>
      ) : (
        <p className='cursor-pointer'>
          Drag 'n' drop a CSV file here, or click to select one
        </p>
      )}
    </div>
  )
}

const Seating = () => {
  const [students, setStudents] = useState<Student[]>([])
  const seats = useMemo(() => getSeats(sections), [])
  const [seatData, setSeatData] = useState<Seat[]>(seats)
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    Papa.parse(file, {
      complete: (result) => {
        console.log(result)
        const parsedStudents = result.data
          .filter((row: any) => row.name && row.roll_no)
          .map((row: any) => ({ name: row.name, id: row.roll_no }))
        console.log(parsedStudents)
        setStudents(parsedStudents)
      },
      header: true
    })
  }, [])

  const assignRandomSeats = useCallback(() => {
    const shuffledStudents = [...students].sort(() => 0.5 - Math.random())
    let studentIndex = 0

    const updatedSeats = seatData.map((seat) => {
      if (!seat.blocked && studentIndex < shuffledStudents.length) {
        const assignedStudent = shuffledStudents[studentIndex]
        studentIndex++
        return { ...seat, student: assignedStudent }
      } else {
        return { ...seat, student: null }
      }
    })
    setSeatData(updatedSeats)
  }, [students, seatData])

  const handleSeatClick = useCallback(
    (seat: Seat) => {
      setSelectedSeat(selectedSeat?.id === seat.id ? null : seat)
    },
    [selectedSeat]
  )

  const handleStudentAssignment = useCallback(() => {
    if (selectedSeat && selectedSeat.student) {
      const updatedSeats = seatData.map((seat) =>
        seat.id === selectedSeat.id
          ? { ...seat, student: selectedSeat.student }
          : seat
      )
      setSeatData(updatedSeats)
      setSelectedSeat(null)
    }
  }, [selectedSeat, seatData])

  const handleStudentRemoval = useCallback(() => {
    if (selectedSeat) {
      const updatedSeats = seatData.map((seat) =>
        seat.id === selectedSeat.id ? { ...seat, student: null } : seat
      )
      setSeatData(updatedSeats)
      setSelectedSeat(null)
    }
  }, [selectedSeat, seatData])

  const handleDownloadCSV = useCallback(() => {
    const csvContent = [
      ['Seat No', 'Section', 'Row No', 'ID', 'Name'], // CSV Header
      ...seatData
        .filter((seat) => seat.student)
        .map((seat) => [
          seat.id,
          seat.section,
          seat.row,
          seat.student?.id || 'Unassigned',
          seat.student?.name || 'Unnamed'
        ])
    ]
    const csvString = csvContent.map((row) => row.join(',')).join('\n')
    const blob = new Blob([csvString], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'seats.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [seatData])
  return (
    <div className='w-full min-h-screen h-full flex justify-between overflow-x-hidden p-4'>
      <div className='h-screen grow flex flex-col items-start max-w-[80%]'>
        <p className='text-2xl font-bold mb-4'>Seating Arrangement</p>
        <div className='overflow-auto w-full grow '>
          <div className='flex flex-col  '>
            <p className='mb-4 text-center font-bold w-full'>SCREEN</p>
            <div className='grid grid-cols-3 gap-4 mb-4 w-max'>
              {['C', 'B', 'A'].map((section) => (
                <RenderSection
                  key={section}
                  selectedSeat={selectedSeat}
                  section={section}
                  seats={seatData}
                  handleSeatClick={handleSeatClick}
                />
              ))}
            </div>
            <div className='grid grid-cols-3 gap-4 mb-4 w-max'>
              {['F', 'E', 'D'].map((section) => (
                <RenderSection
                  key={section}
                  selectedSeat={selectedSeat}
                  section={section}
                  seats={seatData}
                  handleSeatClick={handleSeatClick}
                />
              ))}
            </div>
            <p className='text-center mb-4 w-full'>Entrance</p>
          </div>
        </div>
      </div>
      <div className='min-h-full flex flex-col md:w-1/5 p-4'>
        <FileDrop onDrop={onDrop} />

        <Button onClick={assignRandomSeats} className='mb-4'>
          Assign Random Seats
        </Button>
        {seatData.some((seat) => seat.student) && (
          <Button onClick={handleDownloadCSV} className='mb-4'>
            Download Assigned Seats
          </Button>
        )}
        {selectedSeat && (
          <div className='mb-4'>
            <h2 className='text-xl font-bold mb-2'>
              Selected Seat: {selectedSeat.section}
              {selectedSeat.id}
            </h2>
            <Label htmlFor='studentSelect'>Select Student:</Label>
            <select
              id='studentSelect'
              value={selectedSeat.student?.id || ''}
              onChange={(e) => {
                const student = students.find((s) => s.id === e.target.value)
                if (!student) return
                setSelectedSeat({ ...selectedSeat, student })
              }}
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
