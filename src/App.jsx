import { useEffect, useReducer, useState } from "react";
import { Model } from "survey-core";

import questionnaire from "./features/questionnaire/questionnaire.json";
import help from "./features/questionnaire/questionnaire-help.json";

import QuestionCard from "./features/questionnaire/QuestionCard";
import SectionSidebar from "./features/questionnaire/SectionSidebar";
import ResultsPage from "./features/results/ResultsPage";
import HtmlContent from "./components/HtmlContent";

import {
  createAssessment,
  getOpenSourceNotice,
} from "./domain/assessment";

import {
  loadAssessment,
  saveAssessment,
} from "./services/assessmentStorage";

import "./styles/global.css";

function createSession() {
  const saved = loadAssessment();
  const survey = new Model(questionnaire);

  if (saved) {
    survey.data = saved.data;
    survey.clearIncorrectValues();
  }

  // Απομακρύνουμε και τιμές σε κρυμμένες σελίδες κατά την επαναφορά.
  for (const page of survey.pages) {
    if (!page.isVisible) {
      for (const question of page.questions) {
        question.clearValue();
      }
    }
  }

  const visible = survey.visiblePages;
  const requested = visible.find(
    (page) => page.name === saved?.page,
  );

  const firstUnanswered = visible.find((page) =>
    page.questions.some((question) => question.isEmpty()),
  );

  const page = requested || firstUnanswered || visible[0];

  return {
    survey,
    initialPage: page.questions[0].name,
    initialComplete:
      Boolean(saved?.complete) &&
      Boolean(createAssessment(survey.data)),
  };
}

function scrollToTop() {
  window.scrollTo({ top: 0 });

  requestAnimationFrame(() => {
    const heading = document.querySelector("main h1");

    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
  });
}

export default function App() {
  const [session] = useState(createSession);
  const { survey } = session;

  const [, refresh] = useReducer((value) => value + 1, 0);

  const [current, setCurrent] = useState(session.initialPage);
  const [complete, setComplete] = useState(
    session.initialComplete,
  );
  const [notice, setNotice] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const handler = () => refresh();

    survey.onValueChanged.add(handler);

    return () => {
      survey.onValueChanged.remove(handler);
    };
  }, [survey]);

  const pages = survey.visiblePages;
  const index = pages.findIndex(
    (page) => page.questions[0].name === current,
  );

  const question = survey.getQuestionByName(current);
  const metadata = help.questions[current];

  const result = complete
    ? createAssessment(survey.data)
    : null;

  useEffect(() => {
    saveAssessment({
      data: survey.data,
      page: `page_${current}`,
      complete,
    });
  });

  useEffect(() => {
    if (error) {
      document.querySelector(".error-msg")?.focus();
    }
  }, [error]);

  function reset() {
    survey.clear();
    setCurrent("Q1");
    setComplete(false);
    setNotice(false);
    setError(false);
    refresh();
    scrollToTop();
  }

  function moveTo(name) {
    setCurrent(name);
    setNotice(false);
    setError(false);
    scrollToTop();
  }

  function back() {
    if (notice) {
      setNotice(false);
      scrollToTop();
      return;
    }

    if (complete) {
      setComplete(false);
      scrollToTop();
      return;
    }

    const previous = pages[index - 1]?.questions[0];

    if (previous) {
      moveTo(previous.name);
    }
  }

  function changeAnswer(value) {
    /*
     * Διατηρούμε τη σημερινή συμπεριφορά:
     * αλλαγή πρακτικής ή ρόλου ακυρώνει τη διευκρίνιση Q5a.
     */
    if (current === "Q2" || current === "Q5") {
      survey.clearValue("Q5a");
    }

    survey.setValue(current, value);
    setError(false);
    refresh();
  }

  function advance() {
    const activePages = survey.visiblePages;

    const activeIndex = activePages.findIndex(
      (page) => page.questions[0].name === current,
    );

    const next = activePages[activeIndex + 1]?.questions[0];

    if (next) {
      moveTo(next.name);
      return;
    }

    const assessment = createAssessment(survey.data);

    if (!assessment) {
      setError(true);
      return;
    }

    setNotice(false);
    setComplete(true);
    scrollToTop();
  }

  function submit(event) {
    event.preventDefault();

    if (question.isEmpty()) {
      setError(true);
      return;
    }

    if (current === "Q4" && question.value === "A6") {
      setNotice(true);
      scrollToTop();
      return;
    }

    advance();
  }

  const openSourceNotice = notice
    ? getOpenSourceNotice(survey.data)
    : null;

  const visitedSections = pages
    .slice(0, Math.max(index, 0))
    .filter((page) => !page.questions[0].isEmpty())
    .map((page) => help.questions[page.questions[0].name].section);

  return (
    <>
      <header className="govhead gutter">
        <div className="container">
          <a
            className="service"
            href="#"
            onClick={(event) => {
              event.preventDefault();
              reset();
            }}
          >
            Έλεγχος εφαρμογής του Κανονισμού για την
            Τεχνητή Νοημοσύνη
          </a>

          <small>
            Κανονισμός (ΕΕ) 2024/1689 · ν. 5321/2026
          </small>
        </div>
      </header>

      <div className="subbar gutter">
        <div className="container">
          <span>
            <span className="tag-beta">ΟΔΗΓΟΣ</span>
            Ενημερωτικό εργαλείο. Δεν αποτελεί νομική συμβουλή.
          </span>

          <span>Ενημέρωση: Οκτώβριος 2026</span>
        </div>
      </div>

      <main className="gutter">
        <div className="container" id="app">
          {(index > 0 || notice || complete) && (
            <button
              className="back"
              type="button"
              onClick={back}
            >
              Πίσω
            </button>
          )}

          {result ? (
            <ResultsPage
              result={result}
              survey={survey}
              help={help.questions}
              onEdit={(name) => {
                setComplete(false);
                moveTo(name);
              }}
              onReset={reset}
            />
          ) : openSourceNotice ? (
            <div className="grid full">
              <div className="col">
                <div
                  className={`panel panel--${openSourceNotice.kind}`}
                >
                  <h1>{openSourceNotice.title}</h1>
                  <p>{openSourceNotice.ref}</p>
                </div>

                <HtmlContent
                  className="prose"
                  html={openSourceNotice.body}
                />

                <button
                  className="btn"
                  type="button"
                  onClick={advance}
                >
                  Συνέχεια
                </button>
              </div>
            </div>
          ) : (
            <div className="grid">
              <div className="col">
                <QuestionCard
                  key={current}
                  question={question}
                  metadata={metadata}
                  section={help.sections[metadata.section]}
                  error={error}
                  onChange={changeAnswer}
                  onSubmit={submit}
                />
              </div>

              <SectionSidebar
                sections={help.sections}
                currentSection={metadata.section}
                visitedSections={visitedSections}
                isGpai={
                  survey.getValue("Q1") === "A2" &&
                  current !== "Q1"
                }
                onReset={reset}
              />
            </div>
          )}
        </div>
      </main>

      <footer className="govfoot gutter">
        <div className="container">
          <p>
            <strong>Σχετικά με το εργαλείο.</strong>{" "}
            Ανεξάρτητο ενημερωτικό εργαλείο, όχι επίσημη
            υπηρεσία του Ελληνικού Δημοσίου. Βασίζεται στον
            Κανονισμό (ΕΕ) 2024/1689, όπως τροποποιήθηκε με
            τον Κανονισμό (ΕΕ) 2026/1744 (Ψηφιακό Omnibus
            για την ΤΝ), και στον ν. 5321/2026
            (ΦΕΚ Α΄ 114/20.07.2026).
          </p>

          <p>
            Τα αποτελέσματα είναι ενδεικτικά. Για αποφάσεις
            συμμόρφωσης συμβουλευτείτε τα επίσημα κείμενα
            και νομικό σύμβουλο.
          </p>
        </div>
      </footer>
    </>
  );
}