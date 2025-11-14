export default function Question({ id, value, onChange, onDelete }) {
  return (
    <div className="card">
      <div className="form">
        <label>Question {id}:</label>
        <input
          type="text"
          placeholder="Enter question"
          className="form-inputs"
          value={value}
          onChange={onChange}
        />
        <br />

        <label>Answers:</label>
        <input type="text" placeholder="Option 1" className="form-inputs" />
        <input type="text" placeholder="Option 2" className="form-inputs" />
        <input type="text" placeholder="Option 3" className="form-inputs" />
        <input type="text" placeholder="Option 4" className="form-inputs" />
        <br />

        <label>Correct Answer:</label>
        <select>
          <option value="">Select correct option</option>
          <option value="0">Option 1</option>
          <option value="1">Option 2</option>
          <option value="2">Option 3</option>
          <option value="3">Option 4</option>
        </select>
        <br />
      </div>

      <button onClick={onDelete}>delete</button>
    </div>
  );
}
