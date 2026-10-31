export function SaudaMark({ small = false }: { small?: boolean }) {
  return (
    <span className={`sauda-symbol ${small ? "small" : ""}`} aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}
