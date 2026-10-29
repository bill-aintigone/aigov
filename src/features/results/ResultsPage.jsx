import { useState } from "react";
import HtmlContent from "../../components/HtmlContent";

export default function ResultsPage({
  result,
  survey,
  help,
  onEdit,
  onReset,
}) {
  const [status, setStatus] = useState("");
  const [copyText, setCopyText] = useState("");

  function answerText(name) {
    return survey.getQuestionByName(name).displayValue;
  }

  async function copyAnswers() {
    const text = [
      "Έλεγχος εφαρμογής του Κανονισμού ΤΝ",
      ...result.path.map(
        (name) => `${help[name].short}: ${answerText(name)}`,
      ),
      `Αποτέλεσμα: ${result.title} (${result.ref})`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setStatus("Οι απαντήσεις αντιγράφηκαν");
    } catch {
      setCopyText(text);
      setStatus("Επιλέξτε και αντιγράψτε το κείμενο");
    }
  }

  return (
    <div className="grid full">
      <div className="col">
        <div className={`panel panel--${result.kind}`}>
          <h1>{result.title}</h1>
          <p>{result.ref}</p>
        </div>

        <HtmlContent className="prose" html={result.body} />
        <HtmlContent html={result.obligations} />
        <HtmlContent html={result.extra} />

        <h2>Οι απαντήσεις σας</h2>

        <dl className="summary-list">
          {result.path.map((name) => (
            <div className="row" key={name}>
              <dt>{help[name].short}</dt>
              <dd>{answerText(name)}</dd>

              <button
                className="change"
                type="button"
                onClick={() => onEdit(name)}
              >
                Αλλαγή
                <span className="visually-hidden">
                  {" "}– {help[name].short}
                </span>
              </button>
            </div>
          ))}
        </dl>

        <div className="btn-row">
          <button
            className="btn secondary"
            type="button"
            onClick={copyAnswers}
          >
            Αντιγραφή απαντήσεων
          </button>

          <a
            href="#"
            onClick={(event) => {
              event.preventDefault();
              onReset();
            }}
          >
            Νέος έλεγχος
          </a>

          <span className="status" role="status">
            {status}
          </span>
        </div>

        {copyText && (
          <textarea
            aria-label="Απαντήσεις για αντιγραφή"
            readOnly
            value={copyText}
            onFocus={(event) => event.target.select()}
            style={{ width: "100%", minHeight: 180 }}
          />
        )}
      </div>
    </div>
  );
}