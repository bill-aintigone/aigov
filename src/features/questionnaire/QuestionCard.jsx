import HtmlContent from "../../components/HtmlContent";

export default function QuestionCard({
  question,
  metadata,
  section,
  error,
  onChange,
  onSubmit,
}) {
  const multiple = question.getType() === "checkbox";

  const selected = multiple
    ? question.value || []
    : question.value
      ? [question.value]
      : [];

  const noneValue = question.choices.find(
    (choice) => choice.isExclusive,
    )?.value;

  function change(value, checked) {
    if (!multiple) {
      onChange(value);
      return;
    }

    if (!checked) {
      onChange(selected.filter((item) => item !== value));
      return;
    }

    if (value === noneValue) {
      onChange([value]);
      return;
    }

    onChange([
      ...selected.filter(
        (item) => item !== noneValue && item !== value,
      ),
      value,
    ]);
  }

  return (
    <form
      className={error ? "error" : ""}
      onSubmit={onSubmit}
      noValidate
    >
      <fieldset aria-describedby={`${question.name}-hint`}>
        <legend>
          <span className="caption">{section}</span>
          <h1>{question.title}</h1>
        </legend>

        <p className="hint" id={`${question.name}-hint`}>
          {question.description}
        </p>

        {metadata.definitions.length > 0 && (
          <details className="defs">
            <summary>Ορισμοί που χρειάζεστε</summary>

            <div className="more">
              <dl>
                {metadata.definitions.map(([term, definition]) => (
                  <div key={term}>
                    <dt>{term}</dt>
                    <dd>{definition}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </details>
        )}

        {error && (
          <p
            className="error-msg"
            role="alert"
            tabIndex={-1}
          >
            {question.requiredErrorText}
          </p>
        )}

        <div className="choices">
          {question.visibleChoices.map((choice) => {
            const value = choice.value;
            const id = `${question.name}-${value}`;
            const tip = metadata.options[value];

            return (
              <div key={value}>
                {multiple && value === noneValue && (
                  <div className="or">ή</div>
                )}

                <div className="choice">
                  <input
                    id={id}
                    name={question.name}
                    type={multiple ? "checkbox" : "radio"}
                    value={value}
                    checked={selected.includes(value)}
                    aria-describedby={tip ? `${id}-help` : undefined}
                    onChange={(event) =>
                      change(value, event.target.checked)
                    }
                  />

                  <label htmlFor={id}>{choice.text}</label>

                  {tip && (
                    <div id={`${id}-help`}>
                      <details className="opt-more">
                        <summary>Περισσότερες πληροφορίες</summary>
                        <HtmlContent className="more" html={tip} />
                      </details>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </fieldset>

      <button className="btn" type="submit">
        Συνέχεια
      </button>
    </form>
  );
}