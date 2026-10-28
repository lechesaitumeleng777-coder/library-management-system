
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Library Management System API is running!",
  });
});

app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT DATABASE() AS databaseName");

    res.json({
      message: "MySQL connected successfully!",
      database: rows[0].databaseName,
    });
  } catch (error) {
    console.error("Database connection error:", error.message);

    res.status(500).json({
      message: "Database connection failed",
    });
  }
});


/* =========================
   BOOKS API ROUTES
========================= */

// Get all books
app.get("/books", async (req, res) => {
  try {
    const [books] = await db.query("SELECT * FROM books");
    res.json(books);
  } catch (error) {
    console.error("Get books error:", error.message);
    res.status(500).json({ message: "Failed to retrieve books" });
  }
});

// Get one book
app.get("/books/:id", async (req, res) => {
  try {
    const [books] = await db.query(
      "SELECT * FROM books WHERE id = ?",
      [req.params.id]
    );

    if (books.length === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json(books[0]);
  } catch (error) {
    console.error("Get book error:", error.message);
    res.status(500).json({ message: "Failed to retrieve book" });
  }
});

// Add a book
app.post("/books", async (req, res) => {
  try {
    const { title, author, genre, isbn, quantity } = req.body;

    if (!title || !author || quantity === undefined || Number(quantity) < 0 ||
        !Number.isInteger(Number(quantity))) {
      return res.status(400).json({
        message: "Title, author, and a valid non-negative quantity are required"
      });
    }

    const [result] = await db.query(
      "INSERT INTO books (title, author, genre, isbn, quantity) VALUES (?, ?, ?, ?, ?)",
      [title, author, genre || null, isbn || null, Number(quantity)]
    );

    res.status(201).json({
      message: "Book added successfully",
      id: result.insertId
    });
  } catch (error) {
    console.error("Add book error:", error.message);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "This ISBN already exists" });
    }

    res.status(500).json({ message: "Failed to add book" });
  }
});

// Update a book
app.put("/books/:id", async (req, res) => {
  try {
    const { title, author, genre, isbn, quantity } = req.body;

    if (!title || !author || quantity === undefined || Number(quantity) < 0 ||
        !Number.isInteger(Number(quantity))) {
      return res.status(400).json({
        message: "Title, author, and a valid non-negative quantity are required"
      });
    }

    const [result] = await db.query(
      "UPDATE books SET title = ?, author = ?, genre = ?, isbn = ?, quantity = ? WHERE id = ?",
      [title, author, genre || null, isbn || null, Number(quantity), req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json({ message: "Book updated successfully" });
  } catch (error) {
    console.error("Update book error:", error.message);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "This ISBN already exists" });
    }

    res.status(500).json({ message: "Failed to update book" });
  }
});

// Delete a book
app.delete("/books/:id", async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM books WHERE id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error("Delete book error:", error.message);
    res.status(500).json({ message: "Failed to delete book" });
  }
});



const PORT = process.env.PORT || 5000;


app.get("/transactions", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM transactions ORDER BY transaction_date DESC"
    );

    res.json(rows);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
});

app.post("/transactions", async (req, res) => {
  try {
    const {
      transaction_type,
      book_id,
      book_title,
      user_id,
      borrower_name,
      quantity
    } = req.body;

    if (!transaction_type || !book_title) {
      return res.status(400).json({
        message: "Transaction type and book title are required"
      });
    }

    const [result] = await db.query(
      `INSERT INTO transactions
       (transaction_type, book_id, book_title, user_id,
        borrower_name, quantity)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        transaction_type,
        book_id || null,
        book_title,
        user_id || null,
        borrower_name || null,
        quantity || 1
      ]
    );

    res.status(201).json({
      message: "Transaction saved successfully",
      id: result.insertId
    });
  } catch (error) {
    console.error("Error saving transaction:", error);
    res.status(500).json({
      message: "Failed to save transaction"
    });
  }
});

console.log('Registering USERS route')

app.get('/users', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM users'
    )

    res.json(rows)
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({
      message: 'Failed to fetch users'
    })
  }
})

app.post('/users', async (req, res) => {
  try {
    const { name, membershipId, role } = req.body

    if (!name || !membershipId || !role) {
      return res.status(400).json({
        message: 'Name, membership ID and role are required'
      })
    }

    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE membership_id = ?',
      [membershipId]
    )

    if (existingUsers.length > 0) {
      return res.status(409).json({
        message: 'Membership ID already exists'
      })
    }

    const [result] = await db.query(
      `INSERT INTO users (name, membership_id, role)
       VALUES (?, ?, ?)`,
      [name.trim(), membershipId.trim(), role]
    )

    console.log('USER INSERTED INTO MYSQL:', result.insertId)

    res.status(201).json({
      message: 'User added successfully',
      id: result.insertId
    })
  } catch (error) {
    console.error('Error adding user:', error)
    res.status(500).json({
      message: 'Failed to add user'
    })
  }
})



app.put('/users/:id', async (req, res) => {
  try {
    const { name, membershipId, role } = req.body

    if (!name?.trim() || !membershipId?.trim() || !role) {
      return res.status(400).json({
        message: 'Name, membership ID and role are required'
      })
    }

    const [result] = await db.query(
      `UPDATE users
       SET name = ?, membership_id = ?, role = ?
       WHERE id = ?`,
      [name.trim(), membershipId.trim(), role, req.params.id]
    )

    if (result.affectedRows === 0) {
      const [rows] = await db.query(
        'SELECT id FROM users WHERE id = ?',
        [req.params.id]
      )

      if (rows.length === 0) {
        return res.status(404).json({
          message: 'User not found'
        })
      }
    }

    res.json({ message: 'User updated successfully' })
  } catch (error) {
    console.error('Update user error:', error.message)

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'Membership ID already exists'
      })
    }

    res.status(500).json({
      message: 'Failed to update user'
    })
  }
})

app.delete('/users/:id', async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM users WHERE id = ?',
      [req.params.id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'User not found'
      })
    }

    res.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Delete user error:', error.message)
    res.status(500).json({
      message: 'Failed to delete user'
    })
  }
})


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
