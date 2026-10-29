# AI Act Assessment Tool

An AI Act assessment tool that helps users identify potentially applicable
requirements and obligations based on their role, location and use of
an AI system or general-purpose AI model.

The application provides indicative classifications, obligations and
supporting explanations. It is an independent informational tool
and does not constitute legal advice.

## Tech Stack

- React for the interface.
- Vite for development and production builds.
- SurveyJS Core for questionnaire data and conditional visibility.

## Getting started

Install a Node.js version compatible with the Vite version specified
in package.json, together with npm.

Install the project dependencies:

```bash
npm ci
```

Start the development server:

```bash
npm run dev
```

To access the development server from another machine:

```bash
npm run dev -- --host 0.0.0.0
```

Use the address and port printed in the terminal.

## Production build

Generate the production files:

```bash
npm run build
```

The output is written to dist/.


## Project structure

```text
src/
├── App.jsx
├── main.jsx
├── components/
│   └── HtmlContent.jsx
├── domain/
│   └── assessment.js
├── features/
│   ├── questionnaire/
│   │   ├── QuestionCard.jsx
│   │   ├── SectionSidebar.jsx
│   │   ├── questionnaire.json
│   │   └── questionnaire-help.json
│   └── results/
│       └── ResultsPage.jsx
├── services/
│   └── assessmentStorage.js
└── styles/
    └── global.css
```

## Questionnaire content

### questionnaire.json

Contains the SurveyJS-compatible questionnaire definition:

- Questions and answer choices.
- Required-answer validation.
- Page and choice visibility conditions.
- Exclusive choices such as “None of the above”.

Question and answer identifiers, such as Q2 and A1, are also
referenced by the assessment logic. Changing these identifiers
requires updating the corresponding rules.

### questionnaire-help.json

Contains supporting content and presentation metadata:

- Section names.
- Short question labels.
- Definitions.
- Explanations for individual answer choices.

### assessment.js

Contains the classification and obligation logic, together with
the existing HTML templates used to display results.

Question visibility is defined in questionnaire.json.
Classification rules currently remain in assessment.js.
Changes affecting assessment paths must keep both consistent.

## Styling

global.css defines the application appearance.

QuestionCard renders custom radio buttons, checkboxes and expandable
help sections. SurveyJS Core supplies the questionnaire model;
the application does not load SurveyJS UI styles.

## Saved progress

Assessment progress is stored in the current browser under:

```text
aigov-react-v1
```

To clear it, run the following in the browser console:

```js
localStorage.removeItem("aigov-react-v1");
location.reload();
```

## Legacy migration

scripts/migrate.mjs converts the original source files in legacy/
into the initial questionnaire JSON, help JSON and assessment module.

Run it only when intentionally regenerating these files:

```bash
node scripts/migrate.mjs
```

Regeneration overwrites the generated files and can replace manual
changes. It is not required for normal development or production builds.

## Verification before deployment

Check the following after changes to questionnaire or assessment rules:

- Early termination paths.
- AI system and general-purpose AI model paths.
- Exclusive answer choices.
- Conditional options in Q5a.
- Open-source information and continuation.
- Classification and obligations for each applicable role.
- Editing earlier answers and clearing answers on hidden paths.
- Restoring saved progress.
- Mobile layout and keyboard navigation.