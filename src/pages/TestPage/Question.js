// Handles images + question rendering
const Question = ({ data }) => (
    <div className="question">
      {data.image && <img src={`/uploads/${data.image}`} alt="Question" />}
      <h3>{data.text}</h3>
      <div className="options">
        {data.options.map((opt, i) => (
          <button key={i}>{opt}</button>
        ))}
      </div>
    </div>
  );