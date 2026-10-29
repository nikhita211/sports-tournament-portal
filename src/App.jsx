import Login from "./Login";
import Register from "./Register";
import { useCallback, useEffect, useState } from "react";
import {
  NavLink,
  Route,
  Routes,
  useLocation
} from "react-router-dom";
import {
  getAll,
  getById,
  createRecord,
  updateRecord,
  deleteRecord
} from "./services/api";

const configs = {
  tournaments: {
    title: "Tournaments",
    singular: "Tournament",
    fields: [
      { name: "name", label: "Tournament Name", required: true },
      { name: "sport", label: "Sport", required: true },
      { name: "venue", label: "Venue", required: true },
      { name: "startDate", label: "Start Date", type: "date", required: true },
      { name: "endDate", label: "End Date", type: "date", required: true },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: ["Upcoming", "Ongoing", "Completed"]
      }
    ]
  },
  teams: {
    title: "Teams",
    singular: "Team",
    fields: [
      { name: "name", label: "Team Name", required: true },
      {
        name: "tournamentId",
        label: "Tournament",
        type: "relation",
        source: "tournaments",
        required: true
      },
      { name: "coach", label: "Coach Name", required: true }
    ]
  },
  players: {
    title: "Players",
    singular: "Player",
    fields: [
      { name: "name", label: "Player Name", required: true },
      { name: "age", label: "Age", type: "number", required: true },
      {
        name: "jerseyNumber",
        label: "Jersey Number",
        type: "number",
        required: true
      },
      {
        name: "position",
        label: "Position",
        type: "select",
        options: [
          "Forward", "Midfielder", "Defender", "Goalkeeper",
          "Batsman", "Bowler", "All-rounder", "Wicketkeeper"
        ]
      },
      {
        name: "teamId",
        label: "Team",
        type: "relation",
        source: "teams",
        required: true
      }
    ]
  },
  matches: {
    title: "Matches",
    singular: "Match",
    fields: [
      {
        name: "tournamentId",
        label: "Tournament",
        type: "relation",
        source: "tournaments",
        required: true
      },
      {
        name: "teamAId",
        label: "Team A",
        type: "relation",
        source: "teams",
        required: true
      },
      {
        name: "teamBId",
        label: "Team B",
        type: "relation",
        source: "teams",
        required: true
      },
      { name: "date", label: "Match Date", type: "date", required: true },
      { name: "time", label: "Match Time", type: "time", required: true },
      { name: "venue", label: "Venue", required: true },
      {
        name: "status",
        label: "Match Status",
        type: "select",
        options: ["Scheduled", "In Progress", "Completed"]
      },
      {
        name: "scoreA",
        label: "Team A Score",
        type: "number",
        nullable: true
      },
      {
        name: "scoreB",
        label: "Team B Score",
        type: "number",
        nullable: true
      }
    ]
  }
};

const emptyCollections = {
  tournaments: [],
  teams: [],
  players: [],
  matches: []
};

const navigation = [
  { path: "/", label: "Dashboard", icon: "▦" },
  { path: "/tournaments", label: "Tournaments", icon: "🏆" },
  { path: "/teams", label: "Teams", icon: "👥" },
  { path: "/players", label: "Players", icon: "⚽" },
  { path: "/matches", label: "Matches & Results", icon: "📅" }
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-icon">🏆</span>
        <div>
          <strong>SPORTZONE</strong>
          <small>MANAGEMENT PORTAL</small>
        </div>
      </div>

      <p className="nav-heading">MAIN MENU</p>

      <nav className="nav-list">
        {navigation.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span className="online-dot" />
        JSON Server API
        <small>localhost:3000</small>
      </div>
    </aside>
  );
}

function Layout({ children }) {
  const location = useLocation();
  const current = navigation.find(
    (item) => item.path === location.pathname
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-area">
        <header className="topbar">
          <div>
            <span className="eyebrow">SPORTS ADMINISTRATION</span>
            <h1>{current?.label || "Sports Portal"}</h1>
          </div>
          <div className="admin-profile">
            <div className="avatar">A</div>
            <div>
              <strong>Administrator</strong>
              <small>Portal Manager</small>
            </div>
          </div>
        <div className="auth-buttons">
  <NavLink to="/login" className="auth-btn">
    Login
  </NavLink>

  <NavLink to="/register" className="auth-btn">
    Register
  </NavLink>
</div>


        </header>
        <section className="page-content">{children}</section>
      </main>
    </div>
  );
}

function Dashboard() {
  const [data, setData] = useState(emptyCollections);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      const entries = await Promise.all(
        Object.keys(emptyCollections).map((key) => getAll(key))
      );
      setData(
        Object.fromEntries(
          Object.keys(emptyCollections).map((key, index) => [
            key,
            entries[index]
          ])
        )
      );
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = [
    { label: "Total Tournaments", value: data.tournaments.length, icon: "🏆" },
    { label: "Registered Teams", value: data.teams.length, icon: "👥" },
    { label: "Total Players", value: data.players.length, icon: "⚽" },
    {
      label: "Scheduled Matches",
      value: data.matches.filter((m) => m.status === "Scheduled").length,
      icon: "📅"
    },
    {
      label: "Completed Matches",
      value: data.matches.filter((m) => m.status === "Completed").length,
      icon: "✓"
    }
  ];

  const teamName = (id) =>
    data.teams.find((team) => String(team.id) === String(id))?.name || "Unknown";

  return (
    <>
      <div className="welcome-banner">
        <div>
          <span className="banner-label">ADMIN OVERVIEW</span>
          <h2>Manage your game. Lead your tournament.</h2>
          <p>Track tournaments, teams, players and match results in one place.</p>
        </div>
        <div className="banner-ball">⚽</div>
      </div>
      {error && <p className="error-message">{error}</p>}

      <div className="section-heading">
        <div>
          <h2>Dashboard Overview</h2>
          <p>Live statistics loaded from JSON Server</p>
        </div>
        <button className="button secondary" onClick={load}>↻ Refresh</button>
      </div>

      
<div className="stats-grid">
  {stats.map((stat) => {
    const paths = {
      "Total Tournaments": "/tournaments",
      "Registered Teams": "/teams",
      "Total Players": "/players",
      "Scheduled Matches": "/matches",
      "Completed Matches": "/matches"
    };

    return (
      <NavLink
        to={paths[stat.label]}
        className="stat-card clickable-card"
        key={stat.label}
      >
        <div className="stat-top">
          <span>{stat.label}</span>
          <span className="stat-icon">{stat.icon}</span>
        </div>

        <strong className="stat-value">{stat.value}</strong>
        <small>Click to manage →</small>
      </NavLink>
    );
  })}
</div>


      <div className="panel">
        <div className="panel-heading">
          <div>
            <h2>Recent Matches</h2>
            <p>Scheduled fixtures and recorded results</p>
          </div>
          <NavLink to="/matches" className="text-link">Manage matches →</NavLink>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Match</th>
                <th>Date</th>
                <th>Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.matches.slice(0, 5).map((match) => (
                <tr key={match.id}>
                  <td>{teamName(match.teamAId)} vs {teamName(match.teamBId)}</td>
                  <td>{match.date}</td>
                  <td>
                    {match.status === "Completed"
                      ? `${match.scoreA} - ${match.scoreB}`
                      : "—"}
                  </td>
                  <td><span className={`status ${match.status?.toLowerCase().replace(" ", "-")}`}>{match.status}</span></td>
                </tr>
              ))}
              {!data.matches.length && (
                <tr><td colSpan="4" className="empty">No matches found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function EntityPage({ entity }) {
  const config = configs[entity];
  const [records, setRecords] = useState([]);
  const [relations, setRelations] = useState(emptyCollections);
  const [form, setForm] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [details, setDetails] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [main, tournaments, teams, players, matches] =
        await Promise.all([
          getAll(entity),
          getAll("tournaments"),
          getAll("teams"),
          getAll("players"),
          getAll("matches")
        ]);

      setRecords(main);
      setRelations({ tournaments, teams, players, matches });
    } catch (err) {
      setError(`${err.message}. Check that JSON Server is running on port 3000.`);
    } finally {
      setLoading(false);
    }
  }, [entity]);

  useEffect(() => {
    load();
  }, [load]);

  function resetForm() {
    setForm({});
    setEditingId(null);
  }

  function startEdit(record) {
    setEditingId(record.id);
    setForm({ ...record });
    setDetails(null);
    setNotice("");
    setError("");
    document.getElementById("record-form")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  function fieldValue(field) {
    const value = form[field.name];
    return value === null || value === undefined ? "" : value;
  }

  function relationOptions(field) {
    const items = relations[field.source] || [];
    return items.map((item) => ({
      value: String(item.id),
      label: item.name || item.title || `Record ${item.id}`
    }));
  }

  function displayValue(field, value) {
    if (value === null || value === undefined || value === "") return "—";

    if (field.type === "relation") {
      const item = (relations[field.source] || []).find(
        (record) => String(record.id) === String(value)
      );
      return item?.name || `ID ${value}`;
    }

    if (field.name === "winnerId" && value === "draw") return "Draw";

    return String(value);
  }

  async function submitForm(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const payload = {};

      for (const field of config.fields) {
        const raw = form[field.name];

        if (field.type === "number") {
          payload[field.name] =
            raw === "" || raw === undefined
              ? (field.nullable ? null : "")
              : Number(raw);
        } else {
          payload[field.name] = raw ?? "";
        }
      }

      // Validate relationships and form-specific rules.
      if (entity === "tournaments" &&
          payload.endDate < payload.startDate) {
        throw new Error("End date cannot be before the start date.");
      }

      if (entity === "players") {
        if (payload.age < 1 || payload.age > 120) {
          throw new Error("Enter a valid player age.");
        }
        if (payload.jerseyNumber < 0) {
          throw new Error("Jersey number cannot be negative.");
        }
        const duplicate = records.some(
          (r) =>
            String(r.id) !== String(editingId) &&
            String(r.teamId) === String(payload.teamId) &&
            Number(r.jerseyNumber) === Number(payload.jerseyNumber)
        );
        if (duplicate) {
          throw new Error("That jersey number is already used by this team.");
        }
      }

      if (entity === "teams") {
        const duplicate = records.some(
          (r) =>
            String(r.id) !== String(editingId) &&
            String(r.tournamentId) === String(payload.tournamentId) &&
            r.name.trim().toLowerCase() === payload.name.trim().toLowerCase()
        );
        if (duplicate) {
          throw new Error("This team is already registered in that tournament.");
        }
      }

      if (entity === "matches") {
        if (String(payload.teamAId) === String(payload.teamBId)) {
          throw new Error("Select two different teams.");
        }

        const teamA = relations.teams.find(
          (t) => String(t.id) === String(payload.teamAId)
        );
        const teamB = relations.teams.find(
          (t) => String(t.id) === String(payload.teamBId)
        );

        if (
          !teamA || !teamB ||
          String(teamA.tournamentId) !== String(payload.tournamentId) ||
          String(teamB.tournamentId) !== String(payload.tournamentId)
        ) {
          throw new Error("Both teams must belong to the selected tournament.");
        }

        if (payload.status === "Completed") {
          if (
            payload.scoreA === null || payload.scoreB === null ||
            payload.scoreA < 0 || payload.scoreB < 0
          ) {
            throw new Error("Enter valid non-negative scores for both teams.");
          }

          payload.winnerId =
            payload.scoreA > payload.scoreB
              ? String(payload.teamAId)
              : payload.scoreB > payload.scoreA
                ? String(payload.teamBId)
                : "draw";
        } else {
          payload.scoreA = null;
          payload.scoreB = null;
          payload.winnerId = null;
        }
      }

      if (editingId !== null) {
        await updateRecord(entity, editingId, {
          ...payload,
          id: editingId
        });
        setNotice(`${config.singular} updated successfully.`);
      } else {
        await createRecord(entity, payload);
        setNotice(`${config.singular} added successfully.`);
      }

      resetForm();
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function removeRecord(record) {
    if (!window.confirm(`Delete this ${config.singular.toLowerCase()}?`)) {
      return;
    }

    setError("");
    setNotice("");

    try {
      await deleteRecord(entity, record.id);
      if (String(editingId) === String(record.id)) resetForm();
      setNotice(`${config.singular} deleted successfully.`);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function viewDetails(record) {
    try {
      setError("");
      const result = await getById(entity, record.id);
      setDetails(result);
    } catch (err) {
      setError(err.message);
    }
  }

  const filtered = records.filter((record) =>
    Object.values(record).some((value) =>
      String(value ?? "").toLowerCase().includes(search.toLowerCase())
    )
  );

  function fieldControl(field) {
    const common = {
      id: field.name,
      name: field.name,
      required: field.required,
      value: fieldValue(field),
      onChange: (event) =>
        setForm((old) => ({
          ...old,
          [field.name]: event.target.value
        }))
    };

    if (field.type === "select" || field.type === "relation") {
      const options = field.type === "relation"
        ? relationOptions(field)
        : (field.options || []).map((option) => ({
            value: option,
            label: option
          }));

      return (
        <select {...common}>
          <option value="">Select {field.label}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        {...common}
        type={field.type || "text"}
        min={field.type === "number" ? 0 : undefined}
      />
    );
  }

  const tableFields = config.fields.filter(
    (field) => !["scoreA", "scoreB"].includes(field.name)
  );

  return (
    <>
      <div className="section-heading">
        <div>
          <h2>Manage {config.title}</h2>
          <p>Create, inspect, update and delete server records.</p>
        </div>
        <button className="button secondary" onClick={load}>↻ Refresh</button>
      </div>

      {error && <div className="alert error-message">{error}</div>}
      {notice && <div className="alert success-message">{notice}</div>}

      <div className="content-grid">
        <div className="panel form-panel" id="record-form">
          <div className="panel-heading">
            <div>
              <h2>{editingId !== null ? "Edit" : "Add"} {config.singular}</h2>
              <p>{editingId !== null ? `Editing record #${editingId}` : "Enter the details below"}</p>
            </div>
          </div>

          <form onSubmit={submitForm} className="record-form">
            {config.fields.map((field) => (
              <label className="form-field" key={field.name} htmlFor={field.name}>
                {field.label}
                {fieldControl(field)}
              </label>
            ))}

            {entity === "matches" && (
              <p className="form-hint">
                To record a result, choose Completed and enter both scores.
                The winner or draw is calculated automatically.
              </p>
            )}

            <div className="form-actions">
              <button className="button primary" disabled={saving}>
                {saving ? "Saving..." : editingId !== null ? "Save Changes" : `Add ${config.singular}`}
              </button>
              {editingId !== null && (
                <button type="button" className="button secondary" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="panel records-panel">
          <div className="panel-heading">
            <div>
              <h2>All {config.title}</h2>
              <p>{records.length} records from JSON Server</p>
            </div>
          </div>

          <input
            className="search-input"
            placeholder={`Search ${config.title.toLowerCase()}...`}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          {loading ? (
            <p className="empty">Loading data from API...</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    {tableFields.map((field) => (
                      <th key={field.name}>{field.label}</th>
                    ))}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((record) => (
                    <tr key={record.id}>
                      <td>#{record.id}</td>
                      {tableFields.map((field) => (
                        <td key={field.name}>
                          {field.name === "status" ? (
                            <span className={`status ${String(record.status).toLowerCase().replace(" ", "-")}`}>
                              {record.status}
                            </span>
                          ) : (
                            displayValue(field, record[field.name])
                          )}
                          {entity === "matches" &&
                            ["scoreA", "scoreB"].includes(field.name) && null}
                        </td>
                      ))}
                      <td>
                        <div className="action-buttons">
                          <button className="icon-button" title="View by ID" onClick={() => viewDetails(record)}>View</button>
                          <button className="icon-button edit" title="Edit" onClick={() => startEdit(record)}>Edit</button>
                          <button className="icon-button delete" title="Delete" onClick={() => removeRecord(record)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!filtered.length && (
                    <tr>
                      <td colSpan={tableFields.length + 2} className="empty">
                        {loading ? "Loading..." : "No records found. Add your first record using the form."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {entity === "matches" && records.length > 0 && (
            <div className="results-list">
              <h3>Match Results</h3>
              {records.map((match) => {
                const teamA = relations.teams.find(
                  (t) => String(t.id) === String(match.teamAId)
                )?.name || `Team ${match.teamAId}`;
                const teamB = relations.teams.find(
                  (t) => String(t.id) === String(match.teamBId)
                )?.name || `Team ${match.teamBId}`;
                const winner = match.winnerId === "draw"
                  ? "Draw"
                  : relations.teams.find(
                      (t) => String(t.id) === String(match.winnerId)
                    )?.name;

                return (
                  <div className="result-row" key={match.id}>
                    <div>
                      <strong>{teamA} vs {teamB}</strong>
                      <small>{match.date} · {match.venue}</small>
                    </div>
                    <div className="result-score">
                      {match.status === "Completed"
                        ? `${match.scoreA} - ${match.scoreB}`
                        : "VS"}
                      <small>
                        {match.status === "Completed"
                          ? `Result: ${winner || "Draw"}`
                          : match.status}
                      </small>
                    </div>
                    <button className="button secondary small" onClick={() => startEdit(match)}>
                      {match.status === "Completed" ? "Edit Result" : "Record Result"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {details && (
        <div className="modal-backdrop" onClick={() => setDetails(null)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="panel-heading">
              <div>
                <h2>{config.singular} Details</h2>
                <p>Fetched from GET BY ID</p>
              </div>
              <button className="icon-button" onClick={() => setDetails(null)}>Close</button>
            </div>
            <div className="detail-list">
              {Object.entries(details).map(([key, value]) => {
                const field = config.fields.find((item) => item.name === key);
                return (
                  <div className="detail-item" key={key}>
                    <span>{field?.label || key}</span>
                    <strong>
                      {field ? displayValue(field, value) : String(value ?? "—")}
                    </strong>
                  </div>
                );
              })}
              {entity === "matches" && details.status === "Completed" && (
                <div className="detail-item">
                  <span>Result</span>
                  <strong>
                    {details.winnerId === "draw"
                      ? "Draw"
                      : relations.teams.find(
                          (t) => String(t.id) === String(details.winnerId)
                        )?.name || "Winner"}
                  </strong>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tournaments" element={<EntityPage entity="tournaments" />} />
        <Route path="/teams" element={<EntityPage entity="teams" />} />
        <Route path="/players" element={<EntityPage entity="players" />} />
        <Route path="/matches" element={<EntityPage entity="matches" />} />
        <Route path="*" element={<h2>Page not found</h2>} />
        <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      </Routes>
    </Layout>
  );
}
