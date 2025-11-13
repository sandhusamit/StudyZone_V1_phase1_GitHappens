export default function Question({ id }) {
  return (
    <div className="card">
      <label>Question {id}:</label>
      <br />
      <input type="text" placeholder="Enter question" />
      <br />
      <input type="text" placeholder="Option 1" />
      <br />
      <input type="text" placeholder="Option 2" />
      <br />
      <input type="text" placeholder="Option 3" />
      <br />
      <input type="text" placeholder="Option 4" />
      <br />
      <br />

      <label>Correct Answer:</label>
      <br />
      <select>
        <option value="">Select correct option</option>
        <option value="0">Option 1</option>
        <option value="1">Option 2</option>
        <option value="2">Option 3</option>
        <option value="3">Option 4</option>
      </select>
      <br />
      <br />
    </div>
  );
}
