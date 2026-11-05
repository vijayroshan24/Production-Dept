import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowDownToLine,
  ArrowRight,
  Bell,
  Boxes,
  ChartNoAxesCombined,
  Check,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  Factory,
  Gauge,
  LayoutDashboard,
  LogOut,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || '/api';
const navItems = [
  ['Overview', LayoutDashboard],
  ['Projects', Boxes],
  ['Assembly lines', Factory],
  ['Production log', ClipboardList],
  ['Team', Users],
  ['Reports', ChartNoAxesCombined],
  ['Settings', Settings],
];

const money = (n) => new Intl.NumberFormat('en-IN').format(n ?? 0);
const emptyProject = {
  name: '',
  code: '',
  manager: '',
  assemblyLine: '',
  targetUnits: 1000,
  dueDate: '',
  status: 'ON_TRACK',
};

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      message = (await response.json()).message || message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  return response.status === 204 ? null : response.json();
}

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('Overview');
  const [projects, setProjects] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState('');
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState(emptyProject);

  useEffect(() => {
    request('/auth/me').then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      request('/projects').catch(() => []),
      request('/dashboard/summary').catch(() => null),
      request('/production/updates').catch(() => []),
    ]).then(([p, s, u]) => {
      setProjects(p || []);
      setSummary(s);
      setUpdates(u || []);
    });
  }, [user]);

  const notify = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 2400);
  };

  const signIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const form = new FormData(e.currentTarget);
      const account = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: form.get('email'),
          password: form.get('password'),
        }),
      });
      setUser(account);
    } catch (err) {
      const message = err.message === 'Failed to fetch'
        ? 'Could not reach the API. Start the Spring Boot server and try again.'
        : err.message;
      const loginError = document.getElementById('loginError');
      if (loginError) loginError.textContent = message;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await request('/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setUser(null);
    setPage('Overview');
  };

  const openProjectModal = (project = null) => {
    setDraft(
      project
        ? { ...project, dueDate: project.dueDate ? project.dueDate.slice(0, 10) : '' }
        : emptyProject,
    );
    setModal(project ? { type: 'project', mode: 'edit', id: project.id } : { type: 'project', mode: 'create' });
  };

  const saveProject = async (e) => {
    e.preventDefault();
    const payload = {
      name: draft.name,
      code: draft.code,
      manager: draft.manager,
      assemblyLine: draft.assemblyLine,
      targetUnits: Number(draft.targetUnits),
      dueDate: draft.dueDate,
      status: draft.status,
      completedUnits: Number(draft.completedUnits || 0),
    };

    try {
      const isEdit = modal?.mode === 'edit';
      const url = isEdit ? `/projects/${modal.id}` : '/projects';
      const saved = await request(url, {
        method: isEdit ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });

      setProjects((prev) => {
        if (isEdit) {
          return prev.map((item) => (item.id === saved.id ? saved : item));
        }
        return [saved, ...prev];
      });

      setModal(null);
      notify(isEdit ? 'Project updated' : 'Project created');
    } catch (err) {
      notify(err.message);
    }
  };

  const deleteProject = async (id) => {
    if (!window.confirm('Remove this project from the workspace?')) return;
    try {
      await request(`/projects/${id}`, { method: 'DELETE' });
      setProjects((prev) => prev.filter((project) => project.id !== id));
      notify('Project removed');
    } catch (err) {
      notify(err.message);
    }
  };

  const saveUpdate = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      const item = await request('/production/updates', {
        method: 'POST',
        body: JSON.stringify({
          projectId: Number(form.get('projectId')),
          quantity: Number(form.get('quantity')),
          shift: form.get('shift'),
          note: form.get('note'),
        }),
      });
      setUpdates((prev) => [item, ...prev]);
      setModal(null);
      notify('Production update recorded');
      request('/projects').then(setProjects).catch(() => {});
    } catch (err) {
      notify(err.message);
    }
  };

  const filtered = useMemo(() => {
    return projects.filter((project) => {
      const haystack = `${project.name} ${project.code} ${project.manager} ${project.assemblyLine}`.toLowerCase();
      return haystack.includes(query.toLowerCase());
    });
  }, [projects, query]);

  if (!user) {
    return <Login onSubmit={signIn} loading={loading} />;
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark"><Activity size={19} /></span>
          <span>Prod Status</span>
        </div>

        <div className="nav-caption">MENU</div>
        <nav>
          {navItems.map(([label, Icon]) => (
            <button
              key={label}
              className={`nav-item ${page === label ? 'selected' : ''}`}
              onClick={() => setPage(label)}
            >
              <Icon size={17} />
              {label}
              {label === 'Production log' && updates.length > 0 && (
                <span className="nav-count">{updates.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="support">
            <CircleHelp size={16} />
            <span>Help & support</span>
            <ArrowRight size={13} />
          </div>

          <div className="profile">
            <div className="avatar">{initials(user.name)}</div>
            <span className="profile-name">
              <b>{user.name}</b>
              <small>{prettyRole(user.role)}</small>
            </span>
            <button className="icon-plain" title="Sign out" onClick={logout}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="breadcrumb">Operations <span>/</span> <b>{page}</b></div>
          <div className="top-actions">
            <span className="live"><i />LIVE</span>
            <button className="icon-plain notification" onClick={() => notify('Everything is synced')}>
              <Bell size={17} />
            </button>
            <div className="avatar small-avatar">{initials(user.name)}</div>
          </div>
        </header>

        <section className="content">
          <div className="page-head">
            <div>
              <div className="overline">MONDAY, 04 NOVEMBER 2026 <span>·</span> SHIFT A</div>
              <h1>{page === 'Overview' ? 'Production overview' : page}</h1>
              <p>{pageDescription(page)}</p>
            </div>
            <div className="head-actions">
              <button className="button secondary" onClick={() => notify('Report export started')}>
                <ArrowDownToLine size={15} />Export
              </button>
              <button
                className="button primary"
                onClick={() => (page === 'Production log' ? setModal({ type: 'update' }) : openProjectModal())}
              >
                <Plus size={16} />
                {page === 'Production log' ? 'Log production' : 'New project'}
              </button>
            </div>
          </div>

          {page === 'Overview' ? (
            <Overview projects={projects} updates={updates} summary={summary} onSelect={setPage} />
          ) : (
            <SectionPage
              page={page}
              projects={filtered}
              query={query}
              setQuery={setQuery}
              updates={updates}
              onNewProject={openProjectModal}
              onEditProject={openProjectModal}
              onDeleteProject={deleteProject}
              onCreate={() => (page === 'Production log' ? setModal({ type: 'update' }) : openProjectModal())}
            />
          )}
        </section>
      </main>

      {toast && <div className="toast">{toast}</div>}

      {modal?.type === 'project' && (
        <Modal title={modal.mode === 'edit' ? 'Edit project' : 'Create project'} onClose={() => setModal(null)}>
          <form className="modal-form" onSubmit={saveProject}>
            <label>
              Project name
              <input
                name="name"
                value={draft.name}
                onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                required
              />
            </label>

            <div className="form-grid">
              <label>
                Project code
                <input
                  name="code"
                  value={draft.code}
                  onChange={(event) => setDraft({ ...draft, code: event.target.value })}
                  required
                />
              </label>
              <label>
                Due date
                <input
                  name="dueDate"
                  type="date"
                  value={draft.dueDate}
                  onChange={(event) => setDraft({ ...draft, dueDate: event.target.value })}
                  required
                />
              </label>
            </div>

            <div className="form-grid">
              <label>
                Manager
                <input
                  name="manager"
                  value={draft.manager}
                  onChange={(event) => setDraft({ ...draft, manager: event.target.value })}
                  required
                />
              </label>
              <label>
                Assembly line
                <input
                  name="assemblyLine"
                  value={draft.assemblyLine}
                  onChange={(event) => setDraft({ ...draft, assemblyLine: event.target.value })}
                  required
                />
              </label>
            </div>

            <div className="form-grid">
              <label>
                Target units
                <input
                  name="targetUnits"
                  type="number"
                  min="1"
                  value={draft.targetUnits}
                  onChange={(event) => setDraft({ ...draft, targetUnits: Number(event.target.value) })}
                  required
                />
              </label>
              <label>
                Status
                <select
                  name="status"
                  value={draft.status}
                  onChange={(event) => setDraft({ ...draft, status: event.target.value })}
                >
                  <option value="ON_TRACK">On track</option>
                  <option value="AT_RISK">At risk</option>
                  <option value="DELAYED">Delayed</option>
                </select>
              </label>
            </div>

            <div className="modal-actions">
              <button className="button secondary" type="button" onClick={() => setModal(null)}>
                Cancel
              </button>
              <button className="button primary" type="submit">
                {modal.mode === 'edit' ? 'Save changes' : 'Create project'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modal?.type === 'update' && (
        <Modal title="Record production update" onClose={() => setModal(null)}>
          <form className="modal-form" onSubmit={saveUpdate}>
            <label>
              Project
              <select name="projectId" defaultValue={projects[0]?.id ?? ''} required>
                {projects.map((project) => (
                  <option value={project.id} key={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="form-grid">
              <label>
                Completed units
                <input name="quantity" type="number" min="1" required placeholder="e.g. 42" />
              </label>
              <label>
                Shift
                <select name="shift" defaultValue="Shift A">
                  <option>Shift A</option>
                  <option>Shift B</option>
                  <option>Shift C</option>
                </select>
              </label>
            </div>

            <label>
              Note
              <textarea name="note" placeholder="Add context for this update" />
            </label>

            <div className="modal-actions">
              <button className="button secondary" type="button" onClick={() => setModal(null)}>
                Cancel
              </button>
              <button className="button primary" type="submit">
                Save update
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Login({ onSubmit, loading }) {
  const [show, setShow] = useState(false);

  return (
    <div className="login">
      <div className="login-visual">
        <div className="brand login-brand">
          <span className="brand-mark"><Activity size={19} /></span>
          <span>Prod Status</span>
        </div>

        <div className="visual-copy">
          <div className="overline">PRODUCTION OPERATIONS</div>
          <h1>Every line.<br />In sync.</h1>
          <p>Track delivery, output, and line health across your production floor.</p>
          <div className="status-card">
            <i />
            <span>
              <b>Production workspace</b>
              <small>Secure access for your team</small>
            </span>
            <ShieldCheck size={17} />
          </div>
        </div>

        <div className="visual-foot">PROD STATUS <span>·</span> OPERATIONS PORTAL</div>
      </div>

      <div className="login-panel">
        <form className="login-form" onSubmit={onSubmit}>
          <div className="mobile-brand brand">
            <span className="brand-mark"><Activity size={19} /></span>
            <span>Prod Status</span>
          </div>

          <span className="login-kicker">WORKSPACE SIGN IN</span>
          <h2>Welcome back</h2>
          <p>Sign in to your production workspace.</p>

          <label>
            Work email
            <input name="email" type="email" defaultValue="admin@northstar.local" required autoComplete="username" />
          </label>

          <label>
            Password
            <div className="password-wrap">
              <input
                name="password"
                type={show ? 'text' : 'password'}
                defaultValue="ChangeMe123!"
                required
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShow(!show)}>
                {show ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>

          <div className="login-row">
            <label className="remember">
              <input type="checkbox" defaultChecked /> Remember me
            </label>
            <button
              type="button"
              className="link-button"
              onClick={() => {
                const loginError = document.getElementById('loginError');
                if (loginError) loginError.textContent = 'Contact your workspace administrator to reset your password.';
              }}
            >
              Forgot password?
            </button>
          </div>

          <button className="sign-in" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in to Prod Status'}
            <ArrowRight size={15} />
          </button>

          <div id="loginError" className="login-error" />
          <div className="login-foot">Your activity is protected with encryption and role-based access.</div>
        </form>
      </div>
    </div>
  );
}

function Overview({ projects, updates, summary, onSelect }) {
  const total = projects.length;
  const done = projects.reduce((sum, project) => sum + (project.completedUnits || 0), 0);
  const attention = projects.filter((project) => project.status !== 'ON_TRACK').length;

  return (
    <>
      <div className="metric-grid">
        <Metric label="Active projects" value={summary?.activeProjects ?? total} note="Across all production sites" icon={Boxes} />
        <Metric label="Units completed" value={money(summary?.unitsCompleted ?? done)} note="Recorded across projects" icon={Check} positive />
        <Metric label="On-time delivery" value="94.2%" note="↑ 3.4% vs last week" icon={Gauge} positive />
        <Metric label="Needs attention" value={summary ? summary.atRisk + summary.delayed : attention} note="Schedule review recommended" icon={AlertTriangle} warning />
      </div>

      <div className="overview-grid">
        <article className="panel output-panel">
          <div className="panel-head">
            <div>
              <h2>Production output</h2>
              <p>Daily completed units · recent shifts</p>
            </div>
            <button className="chip" onClick={() => onSelect('Reports')}>This week <ChevronDown size={13} /></button>
          </div>
          <div className="chart-legend">
            <span><i className="legend-green" />Actual output</span>
            <span><i className="legend-plan" />Planned output</span>
          </div>
          <OutputChart />
        </article>

        <article className="panel status-panel">
          <div className="panel-head">
            <div>
              <h2>Project status</h2>
              <p>{total} active projects</p>
            </div>
            <button className="icon-plain" onClick={() => onSelect('Projects')}>•••</button>
          </div>
          <div className="status-content">
            <StatusDonut projects={projects} />
            <div className="status-legend">
              <Legend color="green" label="On track" value={projects.filter((project) => project.status === 'ON_TRACK').length} />
              <Legend color="amber" label="At risk" value={projects.filter((project) => project.status === 'AT_RISK').length} />
              <Legend color="red" label="Delayed" value={projects.filter((project) => project.status === 'DELAYED').length} />
            </div>
          </div>
          {attention > 0 && (
            <div className="attention-note">
              <AlertTriangle size={15} />
              <span>
                <b>{attention} project{attention === 1 ? '' : 's'} need attention</b>
                <small>Review schedules and follow up with managers.</small>
              </span>
            </div>
          )}
        </article>
      </div>
    </>
  );
}

function SectionPage({ page, projects, query, setQuery, updates, onNewProject, onEditProject, onDeleteProject, onCreate }) {
  const isProjects = page === 'Projects';
  const isLog = page === 'Production log';

  return (
    <>
      <div className="section-tabs">
        {(isProjects ? ['All projects', 'On track', 'At risk', 'Delayed'] : isLog ? ['All updates', 'Today', 'Needs review'] : ['All', 'Running', 'Maintenance']).map((tab, index) => (
          <button key={tab} className={index === 0 ? 'active' : ''}>
            {tab}
          </button>
        ))}
      </div>

      {isProjects ? (
        <div className="data-panel">
          <div className="table-heading">
            <div>
              <h2>Projects</h2>
              <small>{projects.length} active items</small>
            </div>
            <div className="table-tools">
              <label className="search-box">
                <Search size={14} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects" />
              </label>
              <button className="button primary" onClick={onNewProject}><Plus size={15} />New project</button>
            </div>
          </div>

          <ProjectTable projects={projects} onEdit={onEditProject} onDelete={onDeleteProject} />
        </div>
      ) : isLog ? (
        <div className="data-panel">
          <div className="table-heading">
            <div>
              <h2>Production log</h2>
              <small>{updates.length} entries</small>
            </div>
            <button className="button primary" onClick={onCreate}><Plus size={15} />Log production</button>
          </div>
          <GenericTable page={page} items={updates} />
        </div>
      ) : (
        <div className="data-panel">
          <div className="table-heading">
            <div>
              <h2>{page}</h2>
              <small>Current status</small>
            </div>
          </div>
          <GenericTable page={page} items={page === 'Reports' ? reportRows : page === 'Team' ? teamRows : page === 'Assembly lines' ? lineRows : []} />
        </div>
      )}
    </>
  );
}

const lineRows = [
  ['Assembly line 01', 'North plant', 'Mohan Das', 'Hydraulic Press Assembly', '428 / 500', 'Running'],
  ['Machining line 02', 'North plant', 'Priya Nair', 'Precision Gearbox Series B', '212 / 400', 'Running'],
  ['Assembly line 03', 'East plant', 'Kiran Rao', 'Conveyor Drive Unit', '94 / 300', 'At risk'],
  ['Fabrication line 01', 'East plant', 'Neha Shah', 'Industrial Pump Housing', '356 / 420', 'Running'],
];

const teamRows = [
  ['Ravi Kumar', 'Manager', 'Assembly line 01', 'Shift A', '2 min ago', 'Active'],
  ['Sunita Patel', 'Manager', 'Machining line 02', 'Shift A', '5 min ago', 'Active'],
  ['Mohan Das', 'Supervisor', 'Assembly line 01', 'Shift A', 'Just now', 'Active'],
  ['Kiran Rao', 'Supervisor', 'Assembly line 03', 'Shift B', '18 min ago', 'Active'],
];

const reportRows = [
  ['Weekly production summary', 'Oct 27 – Nov 02', 'Alex Morgan', 'Nov 03, 2026', 'PDF'],
  ['Project delivery health', 'November 2026', 'Alex Morgan', 'Nov 03, 2026', 'CSV'],
  ['Shift output by line', 'Nov 04, 2026', 'Alex Morgan', 'Today, 10:00 AM', 'CSV'],
];

function GenericTable({ page, items }) {
  const headers =
    page === 'Assembly lines'
      ? ['Assembly line', 'Site', 'Supervisor', 'Current project', 'Output today', 'State']
      : page === 'Team'
        ? ['Team member', 'Role', 'Assigned area', 'Shift', 'Last active', 'Status']
        : page === 'Reports'
          ? ['Report', 'Period', 'Owner', 'Last generated', 'Format']
          : ['Time', 'Project', 'Recorded by', 'Quantity', 'Shift', 'Note'];

  const rows =
    page === 'Production log'
      ? items.map((item) => [
          new Date(item.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          item.project?.name ?? '—',
          item.recordedBy ?? 'System',
          `${item.quantity} units`,
          item.shift,
          item.note || '—',
        ])
      : items;

  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {row.map((cell, cellIndex) => (
                <td key={`${index}-${cellIndex}`}>
                  {cellIndex === row.length - 1 && ['Active', 'Running', 'At risk'].includes(cell) ? (
                    <span className={`status-pill ${cell === 'At risk' ? 'risk' : ''}`}>{cell}</span>
                  ) : (
                    cell
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <div className="empty">Nothing to show yet.</div>}
    </div>
  );
}

function ProjectTable({ projects, onEdit, onDelete }) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Project</th>
            <th>Manager</th>
            <th>Progress</th>
            <th>Due date</th>
            <th>Status</th>
            <th>Assembly line</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => {
            const percent = project.targetUnits
              ? Math.min(100, Math.round(((project.completedUnits || 0) / project.targetUnits) * 100))
              : 0;
            return (
              <tr key={project.id}>
                <td>
                  <div className="project-name">
                    <span className="project-symbol"><Factory size={15} /></span>
                    <span>
                      <strong>{project.name}</strong>
                      <small>{project.code}</small>
                    </span>
                  </div>
                </td>
                <td>
                  <div className="manager">
                    <span className="avatar tiny">{initials(project.manager)}</span>
                    {project.manager}
                  </div>
                </td>
                <td className="progress-cell">
                  <div className="progress-meta">
                    <span>{percent}%</span>
                    <span>
                      {money(project.completedUnits || 0)} / {money(project.targetUnits)}
                    </span>
                  </div>
                  <div className="progress"><i style={{ width: `${percent}%` }} /></div>
                </td>
                <td>{project.dueDate || '—'}</td>
                <td><Status status={project.status} /></td>
                <td>{project.assemblyLine}</td>
                <td>
                  <div className="row-actions">
                    <button className="row-action primary" onClick={() => onEdit(project)}>Edit</button>
                    <button className="row-action danger" onClick={() => onDelete(project.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {projects.length === 0 && <div className="empty">No projects match your search.</div>}
    </div>
  );
}

function Metric({ label, value, note, icon: Icon, positive, warning }) {
  return (
    <article className="metric-card">
      <div className="metric-top">
        {label}
        <span className={`metric-icon ${warning ? 'warm' : ''}`}><Icon size={16} /></span>
      </div>
      <strong className="metric-value">{value}</strong>
      <small className={positive ? 'positive' : warning ? 'warning' : ''}>{note}</small>
    </article>
  );
}

function Status({ status }) {
  const label = status === 'ON_TRACK' ? 'On track' : status === 'AT_RISK' ? 'At risk' : 'Delayed';
  return <span className={`status-pill ${status === 'ON_TRACK' ? 'good' : status === 'AT_RISK' ? 'risk' : 'bad'}`}><i />{label}</span>;
}

function StatusDonut({ projects }) {
  const total = Math.max(projects.length, 1);
  const onTrack = (projects.filter((project) => project.status === 'ON_TRACK').length / total) * 100;
  const atRisk = (projects.filter((project) => project.status === 'AT_RISK').length / total) * 100;

  return (
    <div className="donut" style={{ '--a': `${onTrack}%`, '--b': `${onTrack + atRisk}%` }}>
      <div>
        <b>{projects.length}</b>
        <small>PROJECTS</small>
      </div>
    </div>
  );
}

function Legend({ color, label, value }) {
  return (
    <div className="legend-row">
      <i className={color} />
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

function OutputChart() {
  const actual = [67, 79, 72, 92, 84, 108, 98, 119, 106, 131, 123, 150];
  const plan = [80, 87, 93, 86, 101, 105, 98, 114, 120, 112, 137, 143];
  const coords = (values) => values.map((value, index) => `${32 + index * 48},${175 - value}`).join(' ');

  return (
    <div className="chart">
      <svg viewBox="0 0 590 205" preserveAspectRatio="none">
        <g className="chart-grid">
          {[25, 65, 105, 145, 185].map((y) => <line key={y} x1="30" x2="585" y1={y} y2={y} />)}
        </g>
        <g className="chart-label">
          {['1,200', '900', '600', '300', '0'].map((label, i) => <text key={label} x="0" y={28 + i * 40}>{label}</text>)}
        </g>
        <polyline className="plan-line" points={coords(plan)} />
        <polyline className="actual-line" points={coords(actual)} />
        <circle cx="560" cy={175 - actual.at(-1)} r="4" className="chart-point" />
      </svg>
      <div className="chart-dates"><span>Oct 20</span><span>Oct 24</span><span>Oct 28</span><span>Nov 1</span><span>Nov 4</span></div>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal">
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="icon-plain" onClick={onClose}><X size={17} /></button>
        </div>
        {children}
      </section>
    </div>
  );
}

function initials(name = 'User') {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function prettyRole(role = '') {
  return role
    .toLowerCase()
    .split('_')
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(' ');
}

function pageDescription(page) {
  return {
    Overview: 'Here’s how your production floor is performing today.',
    Projects: 'Track delivery, ownership, and progress across active projects.',
    'Assembly lines': 'Monitor work cells, active shifts, throughput, and line capacity.',
    'Production log': 'Review shift updates and completed units recorded by your production teams.',
    Team: 'People, roles, and production responsibilities for your workspace.',
    Reports: 'Production summaries and delivery performance for your selected period.',
    Settings: 'Manage workspace preferences and production data settings.',
  }[page];
}
