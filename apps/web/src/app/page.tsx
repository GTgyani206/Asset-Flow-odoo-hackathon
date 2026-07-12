const kpis = [
  { label: "Available assets", value: "428", delta: "+18", tone: "good" },
  { label: "Allocated assets", value: "1,284", delta: "76%", tone: "steady" },
  { label: "Overdue returns", value: "23", delta: "+5", tone: "risk" },
  { label: "Booking conflicts blocked", value: "41", delta: "30d", tone: "warn" },
  { label: "Open maintenance", value: "62", delta: "14 urgent", tone: "risk" },
  { label: "Audit completion", value: "87%", delta: "Q3 cycle", tone: "good" },
];

const workQueues = [
  ["Returns awaiting inspection", "12", "Asset Manager"],
  ["Transfer approvals", "9", "Department Head"],
  ["Maintenance approvals", "17", "Asset Manager"],
  ["Audit discrepancies", "31", "Auditor"],
  ["Failed notification deliveries", "4", "Admin"],
];

const assets = [
  ["AF-000184", "ThinkPad T16", "Allocated", "Priya Sharma", "Engineering", "2026-07-20"],
  ["AF-000241", "Thermal camera", "Maintenance", "Warehouse B", "Facilities", "Action required"],
  ["AF-000377", "Pool vehicle 02", "Reserved", "Fleet Desk", "Operations", "16:00"],
  ["AF-000412", "Mac Studio", "Available", "IT Store", "Design", "Ready"],
] as const;

const bookings = [
  ["War room 3", "09:00-10:30", "Audit kickoff", "Confirmed"],
  ["Pool vehicle 02", "16:00-18:00", "Site visit", "Confirmed"],
  ["Calibration bench", "13:00-14:00", "Repair check", "Blackout"],
] as const;

const activity = [
  "Asset AF-000184 allocated with idempotency key recorded",
  "Booking overlap rejected for Calibration bench",
  "Audit item AF-000241 marked damaged by assigned auditor",
  "Outbox published MaintenanceApproved event",
];

const roles = ["Admin", "Asset Manager", "Department Head", "Employee", "Auditor"];

export default function HomePage() {
  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="brand-block">
          <span className="brand-mark" aria-hidden="true">AF</span>
          <div>
            <p className="eyebrow">AssetFlow</p>
            <h1>Operations Console</h1>
          </div>
        </div>

        <nav className="nav-list">
          {["Dashboard", "Assets", "Allocations", "Bookings", "Maintenance", "Audits", "Reports"].map((item) => (
            <a href={`#${item.toLowerCase()}`} key={item} className={item === "Dashboard" ? "active" : ""}>
              {item}
            </a>
          ))}
        </nav>

        <section className="role-switcher" aria-label="Role views">
          <p className="section-label">Role view</p>
          <div className="segmented">
            {roles.map((role, index) => (
              <button key={role} className={index === 1 ? "selected" : ""} type="button">
                {role}
              </button>
            ))}
          </div>
        </section>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Tenant: Northwind Manufacturing</p>
            <h2>Asset custody, bookings, maintenance, and audits</h2>
          </div>
          <div className="topbar-actions">
            <button type="button">Scan</button>
            <button type="button">New asset</button>
            <button type="button" className="primary">Allocate</button>
          </div>
        </header>

        <section className="kpi-grid" aria-label="Operational KPIs">
          {kpis.map((kpi) => (
            <article className={`metric ${kpi.tone}`} key={kpi.label}>
              <p>{kpi.label}</p>
              <strong>{kpi.value}</strong>
              <span>{kpi.delta}</span>
            </article>
          ))}
        </section>

        <section className="split-layout">
          <div className="panel" id="assets">
            <div className="panel-heading">
              <h3>Asset registry</h3>
              <span>Fresh 2 min ago</span>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Tag</th>
                  <th>Asset</th>
                  <th>Status</th>
                  <th>Holder</th>
                  <th>Dept</th>
                  <th>Next action</th>
                </tr>
              </thead>
              <tbody>
                {assets.map(([tag, name, status, holder, dept, action]) => (
                  <tr key={tag}>
                    <td>{tag}</td>
                    <td>{name}</td>
                    <td><span className={`status ${status.toLowerCase()}`}>{status}</span></td>
                    <td>{holder}</td>
                    <td>{dept}</td>
                    <td>{action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="panel queue-panel">
            <div className="panel-heading">
              <h3>Work queues</h3>
              <span>Scoped to role</span>
            </div>
            <div className="queue-list">
              {workQueues.map(([label, count, owner]) => (
                <button type="button" className="queue-row" key={label}>
                  <span>{label}</span>
                  <strong>{count}</strong>
                  <em>{owner}</em>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="three-column">
          <div className="panel" id="bookings">
            <div className="panel-heading">
              <h3>Bookings today</h3>
              <span>No overlaps</span>
            </div>
            {bookings.map(([resource, time, purpose, status]) => (
              <div className="booking-row" key={`${resource}-${time}`}>
                <time>{time}</time>
                <div>
                  <strong>{resource}</strong>
                  <span>{purpose}</span>
                </div>
                <span className={`status ${status.toLowerCase()}`}>{status}</span>
              </div>
            ))}
          </div>

          <div className="panel" id="maintenance">
            <div className="panel-heading">
              <h3>Maintenance</h3>
              <span>14 urgent</span>
            </div>
            <div className="stacked-stat">
              <strong>8.4h</strong>
              <span>Median approval time</span>
            </div>
            <div className="progress-track" aria-label="Maintenance SLA">
              <span style={{ width: "68%" }} />
            </div>
            <p className="panel-note">Resource blackouts are attached before future bookings are flagged for action.</p>
          </div>

          <div className="panel" id="audits">
            <div className="panel-heading">
              <h3>Audit cycle</h3>
              <span>Review</span>
            </div>
            <div className="audit-meter">
              <strong>1,482</strong>
              <span>snapshot items</span>
            </div>
            <div className="audit-results">
              <span>Verified 1,289</span>
              <span>Missing 19</span>
              <span>Damaged 12</span>
            </div>
          </div>
        </section>

        <section className="panel activity-panel">
          <div className="panel-heading">
            <h3>Immutable activity</h3>
            <span>Correlation IDs retained</span>
          </div>
          <ol>
            {activity.map((entry) => (
              <li key={entry}>{entry}</li>
            ))}
          </ol>
        </section>
      </section>
    </main>
  );
}
