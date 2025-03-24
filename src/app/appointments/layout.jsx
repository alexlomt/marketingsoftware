export default function AppointmentsLayout({ children }) {
  return (
    <div className="appointments-container">
      <div className="appointments-content">
        {children}
      </div>
    </div>
  );
}
