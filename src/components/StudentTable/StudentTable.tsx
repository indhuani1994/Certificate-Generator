import { StudentRecord } from '../../types';

interface StudentTableProps {
  students: StudentRecord[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  isGenerating: boolean;
}

const StudentTable = ({ students, selectedIndex, onSelect, isGenerating }: StudentTableProps) => (
  <div className="table-card">
    <div className="section-header">
      <h2>STEP 4 - STUDENT DETAILS</h2>
      <p>Imported student data</p>
    </div>
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>No.</th>
            <th>Reg No</th>
            <th>Student Name</th>
            <th>Course</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Duration</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.length === 0 ? (
            <tr>
              <td colSpan={9} className="empty-row">
                No student data available.
              </td>
            </tr>
          ) : (
            students.map((student, index) => (
              <tr key={student.rowNumber} className={student.status === 'Invalid' ? 'invalid-row' : selectedIndex === index ? 'selected-row' : ''}>
                <td>{index + 1}</td>
                <td>{student.regNo}</td>
                <td>{student.name}</td>
                <td>{student.course}</td>
                <td>{student.startDateFormatted}</td>
                <td>{student.endDateFormatted}</td>
                <td>{student.duration}</td>
                <td>{student.status}</td>
                <td>
                  <button type="button" disabled={isGenerating} onClick={() => onSelect(index)}>
                    Preview
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default StudentTable;
