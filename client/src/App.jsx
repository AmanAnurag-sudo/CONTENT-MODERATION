import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Check,
  Clock3,
  FileText,
  Filter,
  LayoutDashboard,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Sparkles,
  Users,
  X
} from "lucide-react";

const API =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const demoContent = [
  {
    id: "demo-1",
    title: "Campus orientation campaign",
    description:
      "A launch campaign for new students joining the Smart Campus Hub.",
    content_type: "campaign",
    status: "in_review",
    priority: "high",
    due_date: "2026-11-09",
    owner_name: "Arjun Kumar",
    reviewer_name: "Dr. R. Mehta",
    open_comments: 4
  },
  {
    id: "demo-2",
    title: "How to use the resource finder",
    description:
      "An onboarding article explaining how students can discover campus resources.",
    content_type: "article",
    status: "changes_requested",
    priority: "normal",
    due_date: "2026-11-12",
    owner_name: "Arjun Kumar",
    reviewer_name: "Priya Shah",
    open_comments: 2
  },
  {
    id: "demo-3",
    title: "Student wellbeing week social set",
    description:
      "Three social posts for the upcoming student wellbeing awareness week.",
    content_type: "social",
    status: "approved",
    priority: "normal",
    due_date: "2026-11-06",
    owner_name: "Arjun Kumar",
    reviewer_name: "Dr. R. Mehta",
    open_comments: 0
  },
  {
    id: "demo-4",
    title: "Faculty update email",
    description:
      "Monthly product update for faculty and department coordinators.",
    content_type: "email",
    status: "draft",
    priority: "low",
    due_date: "2026-11-19",
    owner_name: "Arjun Kumar",
    reviewer_name: "Priya Shah",
    open_comments: 0
  }
];

const statusLabels = {
  all: "All content",
  draft: "Draft",
  in_review: "In review",
  changes_requested: "Changes requested",
  approved: "Approved",
  rejected: "Rejected"
};

export default function App() {
  const [content, setContent] = useState([]);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadContent() {
    try {
      const response = await fetch(
        `${API}/content?status=${status}&search=${encodeURIComponent(search)}`
      );

      if (!response.ok) {
        throw new Error("API unavailable");
      }

      setContent(await response.json());
    } catch {
      const query = search.toLowerCase();

      setContent(
        demoContent.filter(
          (item) =>
            (status === "all" || item.status === status) &&
            `${item.title} ${item.description}`
              .toLowerCase()
              .includes(query)
        )
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(loadContent, 180);
    return () => clearTimeout(timer);
  }, [status, search]);

  const metrics = useMemo(
    () => ({
      total: content.length,
      review: content.filter((item) => item.status === "in_review").length,
      changes: content.filter(
        (item) => item.status === "changes_requested"
      ).length,
      approved: content.filter((item) => item.status === "approved").length
    }),
    [content]
  );

  async function openReview(item) {
    try {
      const response = await fetch(`${API}/content/${item.id}`);

      if (response.ok) {
        setSelected(await response.json());
        return;
      }
    } catch {}

    setSelected({
      ...item,
      comments: [
        {
          id: "c1",
          author_name: "Dr. R. Mehta",
          body: "Add one measurable outcome to the campaign objective.",
          created_at: "2 hours ago"
        },
        {
          id: "c2",
          author_name: "Priya Shah",
          body: "The call to action is clear. Consider shortening the second paragraph.",
          created_at: "Yesterday"
        }
      ]
    });
  }

  async function changeStatus(nextStatus) {
    if (!selected) return;

    setSelected({
      ...selected,
      status: nextStatus
    });

    setContent((items) =>
      items.map((item) =>
        item.id === selected.id
          ? { ...item, status: nextStatus }
          : item
      )
    );

    try {
      await fetch(`${API}/content/${selected.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status: nextStatus
        })
      });
    } catch {}
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">R</div>
          <div>
            <b>reviewly</b>
            <span>content operations</span>
          </div>
        </div>

        <nav>
          <p className="nav-label">Workspace</p>

          <a className="nav-link active">
            <LayoutDashboard size={17} />
            Overview
          </a>

          <a className="nav-link">
            <FileText size={17} />
            My content
            <span className="nav-count">{metrics.total}</span>
          </a>

          <a className="nav-link">
            <MessageSquare size={17} />
            Feedback
            <span className="nav-count orange">6</span>
          </a>

          <a className="nav-link">
            <Users size={17} />
            Team
          </a>

          <p className="nav-label second">Manage</p>

          <a className="nav-link">
            <Settings size={17} />
            Settings
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <Sparkles size={16} />
            <b>Review smarter</b>
            <p>Keep every comment and approval in one place.</p>
            <button>Learn more →</button>
          </div>

          <div className="user">
            <div className="avatar">AK</div>
            <div>
              <b>Arjun Kumar</b>
              <span>Editor</span>
            </div>
            <MoreHorizontal size={17} />
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p className="crumb">Workspace / Overview</p>
            <h1>
              Good morning, Arjun <span>✦</span>
            </h1>
          </div>

          <div className="top-actions">
            <button className="notification">
              <Bell size={19} />
              <i />
            </button>
            <div className="avatar">AK</div>
          </div>
        </header>

        <section className="welcome">
          <div>
            <p className="eyebrow light">Content review workspace</p>
            <h2>
              Make every piece
              <br />
              better together.
            </h2>
            <p>
              Submit, review, and approve content without losing the
              conversation.
            </p>
            <button
              className="white-button"
              onClick={() => setShowNew(true)}
            >
              Create content
              <Plus size={16} />
            </button>
          </div>

          <div className="welcome-art">
            <div className="ring ring-a" />
            <div className="ring ring-b" />

            <div className="floating-note note-a">
              <Check size={14} />
              Approved
            </div>

            <div className="floating-note note-b">
              <MessageSquare size={14} />
              6 comments
            </div>

            <div className="paper">
              <div className="paper-line small" />
              <div className="paper-line" />
              <div className="paper-line" />
              <div className="paper-highlight" />
              <div className="paper-line short" />
            </div>
          </div>
        </section>

        <section className="section-title">
          <div>
            <p className="eyebrow">At a glance</p>
            <h2>Review overview</h2>
          </div>

          <span className="last-updated">
            <Clock3 size={14} />
            Updated just now
          </span>
        </section>

        <section className="metrics">
          <Metric
            icon={<FileText />}
            color="purple"
            label="Total content"
            value={metrics.total}
            helper="Across all projects"
          />

          <Metric
            icon={<Clock3 />}
            color="orange"
            label="In review"
            value={metrics.review}
            helper="Needs your attention"
          />

          <Metric
            icon={<MessageSquare />}
            color="blue"
            label="Changes requested"
            value={metrics.changes}
            helper="Waiting on updates"
          />

          <Metric
            icon={<Check />}
            color="green"
            label="Approved"
            value={metrics.approved}
            helper="Ready to publish"
          />
        </section>

        <section className="section-title content-heading">
          <div>
            <p className="eyebrow">Content library</p>
            <h2>Recent content</h2>
          </div>

          <button
            className="primary-button"
            onClick={() => setShowNew(true)}
          >
            <Plus size={16} />
            New content
          </button>
        </section>

        <section className="toolbar">
          <div className="search">
            <Search size={16} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search content..."
            />
          </div>

          <div className="filters">
            <Filter size={15} />
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              {Object.entries(statusLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="content-table">
          <div className="table-head">
            <span>Content</span>
            <span>Owner</span>
            <span>Reviewer</span>
            <span>Due date</span>
            <span>Status</span>
            <span />
          </div>

          {loading ? (
            <div className="empty">Loading content...</div>
          ) : content.length ? (
            content.map((item) => (
              <ContentRow
                key={item.id}
                item={item}
                onClick={() => openReview(item)}
              />
            ))
          ) : (
            <div className="empty">
              No content matches this filter.
            </div>
          )}
        </section>
      </main>

      {selected && (
        <ReviewDrawer
          content={selected}
          onClose={() => setSelected(null)}
          onStatus={changeStatus}
        />
      )}

      {showNew && (
        <NewContent
          onClose={() => setShowNew(false)}
          onCreated={(item) => {
            setContent((items) => [item, ...items]);
            setShowNew(false);
          }}
        />
      )}
    </div>
  );
}

function Metric({ icon, color, label, value, helper }) {
  return (
    <article className="metric">
      <div className={`metric-icon ${color}`}>{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{helper}</small>
      </div>
    </article>
  );
}

function ContentRow({ item, onClick }) {
  return (
    <button className="content-row" onClick={onClick}>
      <div className="content-cell">
        <div className={`type-icon ${item.content_type}`}>
          {item.content_type === "social"
            ? "◎"
            : item.content_type === "email"
              ? "✉"
              : item.content_type === "campaign"
                ? "⌁"
                : "▤"}
        </div>

        <div>
          <b>{item.title}</b>
          <span>
            {item.content_type} · {item.open_comments || 0} open comments
          </span>
        </div>
      </div>

      <div className="person-cell">
        <div className="mini-avatar purple">AK</div>
        {item.owner_name || "Arjun Kumar"}
      </div>

      <div className="person-cell">
        <div className="mini-avatar blue">
          {(item.reviewer_name || "Reviewer")
            .slice(0, 2)
            .toUpperCase()}
        </div>
        {item.reviewer_name || "Unassigned"}
      </div>

      <span className="due">
        {item.due_date
          ? new Date(`${item.due_date}T00:00:00`).toLocaleDateString(
              "en-IN",
              {
                day: "2-digit",
                month: "short"
              }
            )
          : "—"}
      </span>

      <Status status={item.status} />

      <MoreHorizontal size={17} className="row-more" />
    </button>
  );
}

function Status({ status }) {
  return (
    <span className={`status ${status}`}>
      <i />
      {statusLabels[status]}
    </span>
  );
}

function ReviewDrawer({ content, onClose, onStatus }) {
  const [comment, setComment] = useState("");

  return (
    <div className="drawer-layer" onClick={onClose}>
      <aside
        className="drawer"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="drawer-head">
          <div>
            <p className="eyebrow">Review workspace</p>
            <h2>{content.title}</h2>
          </div>

          <button className="close" onClick={onClose}>
            <X size={19} />
          </button>
        </div>

        <div className="drawer-meta">
          <Status status={content.status} />
          <span>{content.content_type}</span>
          <span>Version 1</span>
        </div>

        <div className="preview">
          <p className="preview-label">CONTENT PREVIEW</p>
          <h3>{content.title}</h3>
          <p>{content.description}</p>

          <div className="preview-lines">
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>

        <div className="review-actions">
          <button className="approve" onClick={() => onStatus("approved")}>
            <Check size={15} />
            Approve
          </button>

          <button
            className="request"
            onClick={() => onStatus("changes_requested")}
          >
            <MessageSquare size={15} />
            Request changes
          </button>

          <button className="reject" onClick={() => onStatus("rejected")}>
            Reject
          </button>
        </div>

        <div className="comments">
          <div className="comment-title">
            <h3>Discussion</h3>
            <span>{content.comments?.length || 0} comments</span>
          </div>

          {content.comments?.map((item) => (
            <div className="comment" key={item.id}>
              <div className="mini-avatar orange">
                {(item.author_name || "U").slice(0, 2).toUpperCase()}
              </div>

              <div>
                <b>{item.author_name || "Reviewer"}</b>
                <p>{item.body}</p>
                <small>{item.created_at}</small>
              </div>
            </div>
          ))}

          <div className="comment-form">
            <input
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Add a comment..."
            />
            <button disabled={!comment.trim()}>
              <MessageSquare size={15} />
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function NewContent({ onClose, onCreated }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    contentType: "article",
    priority: "normal"
  });

  async function submit(event) {
    event.preventDefault();

    const local = {
      ...form,
      id: `local-${Date.now()}`,
      status: "draft",
      owner_name: "Arjun Kumar",
      reviewer_name: "Unassigned",
      open_comments: 0
    };

    try {
      const response = await fetch(`${API}/content`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      if (response.ok) {
        onCreated(await response.json());
        return;
      }
    } catch {}

    onCreated(local);
  }

  return (
    <div className="modal-layer" onClick={onClose}>
      <form
        className="modal"
        onSubmit={submit}
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="close" onClick={onClose}>
          <X size={19} />
        </button>

        <p className="eyebrow">Content library</p>
        <h2>Create new content</h2>

        <label>
          Title
          <input
            required
            value={form.title}
            onChange={(event) =>
              setForm({
                ...form,
                title: event.target.value
              })
            }
            placeholder="e.g. Product launch announcement"
          />
        </label>

        <label>
          Description
          <textarea
            value={form.description}
            onChange={(event) =>
              setForm({
                ...form,
                description: event.target.value
              })
            }
            placeholder="What should reviewers know?"
            rows="4"
          />
        </label>

        <div className="form-grid">
          <label>
            Type
            <select
              value={form.contentType}
              onChange={(event) =>
                setForm({
                  ...form,
                  contentType: event.target.value
                })
              }
            >
              <option value="article">Article</option>
              <option value="social">Social</option>
              <option value="video">Video</option>
              <option value="email">Email</option>
              <option value="campaign">Campaign</option>
            </select>
          </label>

          <label>
            Priority
            <select
              value={form.priority}
              onChange={(event) =>
                setForm({
                  ...form,
                  priority: event.target.value
                })
              }
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </label>
        </div>

        <button className="primary-button submit" type="submit">
          Create content
          <Plus size={16} />
        </button>
      </form>
    </div>
  );
}