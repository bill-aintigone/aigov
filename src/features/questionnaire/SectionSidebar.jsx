export default function SectionSidebar({
  sections,
  currentSection,
  visitedSections,
  isGpai,
  onReset,
}) {
  const order = ["demo", "prohib", "hr", "transp", "gpai"];

  const shown = order.filter((section) =>
    isGpai
      ? ["demo", "gpai"].includes(section)
      : section !== "gpai",
  );

  return (
    <aside className="side">
      <h2>Ενότητες</h2>

      <ol>
        {shown.map((section) => (
          <li
            key={section}
            className={
              section === currentSection
                ? "current"
                : visitedSections.includes(section)
                  ? "done"
                  : ""
            }
          >
            {sections[section]}
          </li>
        ))}
      </ol>

      <a
        href="#"
        className="restart"
        onClick={(event) => {
          event.preventDefault();
          onReset();
        }}
      >
        Ξεκινήστε από την αρχή
      </a>
    </aside>
  );
}