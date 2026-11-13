import "dotenv/config";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import { query } from "./db/pool.js";

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173"
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

const asyncRoute =
  (handler) => (req, res, next) =>
    Promise.resolve(handler(req, res, next)).catch(next);

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "content-review-api"
  });
});

app.get(
  "/api/dashboard",
  asyncRoute(async (_req, res) => {
    const result = await query(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (
          WHERE status = 'in_review'
        )::int AS in_review,
        COUNT(*) FILTER (
          WHERE status = 'changes_requested'
        )::int AS changes_requested,
        COUNT(*) FILTER (
          WHERE status = 'approved'
        )::int AS approved
      FROM content_items
    `);

    res.json(result.rows[0]);
  })
);

app.get(
  "/api/content",
  asyncRoute(async (req, res) => {
    const { status, search } = req.query;
    const filters = [];
    const values = [];

    if (status && status !== "all") {
      values.push(status);
      filters.push(`c.status = $${values.length}`);
    }

    if (search) {
      values.push(`%${search}%`);
      filters.push(`
        (
          c.title ILIKE $${values.length}
          OR c.description ILIKE $${values.length}
        )
      `);
    }

    const where = filters.length
      ? `WHERE ${filters.join(" AND ")}`
      : "";

    const result = await query(
      `
        SELECT
          c.*,
          o.name AS owner_name,
          r.name AS reviewer_name,
          (
            SELECT COUNT(*)::int
            FROM comments cm
            WHERE cm.content_id = c.id
              AND cm.resolved = false
          ) AS open_comments
        FROM content_items c
        LEFT JOIN users o ON o.id = c.owner_id
        LEFT JOIN users r ON r.id = c.reviewer_id
        ${where}
        ORDER BY c.updated_at DESC
      `,
      values
    );

    res.json(result.rows);
  })
);

app.get(
  "/api/content/:id",
  asyncRoute(async (req, res) => {
    const content = await query(
      `
        SELECT
          c.*,
          o.name AS owner_name,
          r.name AS reviewer_name
        FROM content_items c
        LEFT JOIN users o ON o.id = c.owner_id
        LEFT JOIN users r ON r.id = c.reviewer_id
        WHERE c.id = $1
      `,
      [req.params.id]
    );

    if (!content.rowCount) {
      return res.status(404).json({
        message: "Content not found"
      });
    }

    const [comments, activity] = await Promise.all([
      query(
        `
          SELECT
            cm.*,
            u.name AS author_name,
            u.avatar_color
          FROM comments cm
          LEFT JOIN users u ON u.id = cm.author_id
          WHERE cm.content_id = $1
          ORDER BY cm.created_at DESC
        `,
        [req.params.id]
      ),
      query(
        `
          SELECT
            a.*,
            u.name AS actor_name
          FROM activity a
          LEFT JOIN users u ON u.id = a.actor_id
          WHERE a.content_id = $1
          ORDER BY a.created_at DESC
        `,
        [req.params.id]
      )
    ]);

    res.json({
      ...content.rows[0],
      comments: comments.rows,
      activity: activity.rows
    });
  })
);

app.post(
  "/api/content",
  asyncRoute(async (req, res) => {
    const {
      title,
      description = "",
      contentType = "article",
      priority = "normal",
      dueDate
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        message: "Title is required"
      });
    }

    const result = await query(
      `
        INSERT INTO content_items
          (
            title,
            description,
            content_type,
            priority,
            due_date
          )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `,
      [
        title.trim(),
        description,
        contentType,
        priority,
        dueDate || null
      ]
    );

    res.status(201).json(result.rows[0]);
  })
);

app.patch(
  "/api/content/:id/status",
  asyncRoute(async (req, res) => {
    const allowed = [
      "draft",
      "in_review",
      "changes_requested",
      "approved",
      "rejected"
    ];

    const { status } = req.body;

    if (!allowed.includes(status)) {
      return res.status(400).json({
        message: "Invalid status"
      });
    }

    const result = await query(
      `
        UPDATE content_items
        SET
          status = $1,
          updated_at = NOW()
        WHERE id = $2
        RETURNING *
      `,
      [status, req.params.id]
    );

    if (!result.rowCount) {
      return res.status(404).json({
        message: "Content not found"
      });
    }

    await query(
      `
        INSERT INTO activity
          (content_id, action, metadata)
        VALUES ($1, $2, $3)
      `,
      [
        req.params.id,
        `status_changed_to_${status}`,
        JSON.stringify({ status })
      ]
    );

    res.json(result.rows[0]);
  })
);

app.post(
  "/api/content/:id/comments",
  asyncRoute(async (req, res) => {
    const { body, authorId } = req.body;

    if (!body?.trim()) {
      return res.status(400).json({
        message: "Comment is required"
      });
    }

    const result = await query(
      `
        INSERT INTO comments
          (content_id, author_id, body)
        VALUES ($1, $2, $3)
        RETURNING id, content_id, body, created_at
      `,
      [
        req.params.id,
        authorId || null,
        body.trim()
      ]
    );

    await query(
      `
        UPDATE content_items
        SET updated_at = NOW()
        WHERE id = $1
      `,
      [req.params.id]
    );

    res.status(201).json(result.rows[0]);
  })
);

app.use((err, _req, res, _next) => {
  console.error(err);

  res.status(500).json({
    message: "Internal server error"
  });
});

app.listen(port, () => {
  console.log(
    `Content review API running on http://localhost:${port}`
  );
});