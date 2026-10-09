import { useEffect, useState } from 'react'
import './App.css'

function App() {

  // =========================================================
  // NAVIGATION
  // =========================================================

  const [activeSection, setActiveSection] = useState('login')


  // =========================================================
  // BOOKS
  // =========================================================

  const [books, setBooks] = useState(() => {
    const savedBooks = localStorage.getItem('books')
    return savedBooks ? JSON.parse(savedBooks) : []
  })

  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [genre, setGenre] = useState('')
  const [isbn, setIsbn] = useState('')
  const [quantity, setQuantity] = useState('')
  const [editingId, setEditingId] = useState(null)


  // =========================================================
  // USERS
  // =========================================================

 
const [users, setUsers] = useState(() => {
  const savedUsers = localStorage.getItem('users')

  if (savedUsers) {
    const parsedUsers = JSON.parse(savedUsers)

    if (parsedUsers.length > 0) {
      return parsedUsers
    }
  }

  return [
    {
      id: 1,
      name: 'Demo Admin',
      membershipId: '001',
      role: 'Admin'
    }
  ]
})

  const [name, setName] = useState('')
  const [membershipId, setMembershipId] = useState('')
  const [role, setRole] = useState('Member')
  const [editingUserId, setEditingUserId] = useState(null)


  // =========================================================
  // LOGIN
  // =========================================================

  const [loginId, setLoginId] = useState('')
  const [loggedInUser, setLoggedInUser] = useState(null)


  // =========================================================
  // TRANSACTIONS
  // =========================================================

  const [transactions, setTransactions] = useState(() => {
    const savedTransactions =
      localStorage.getItem('transactions')

    return savedTransactions
      ? JSON.parse(savedTransactions)
      : []
  })


  // =========================================================
  // LOCAL STORAGE
  // =========================================================

  useEffect(() => {
    localStorage.setItem(
      'books',
      JSON.stringify(books)
    )
  }, [books])


  useEffect(() => {
    localStorage.setItem(
      'users',
      JSON.stringify(users)
    )
  }, [users])


  useEffect(() => {
    localStorage.setItem(
      'transactions',
      JSON.stringify(transactions)
    )
  }, [transactions])


  // =========================================================
  // DASHBOARD CALCULATIONS
  // =========================================================

  const totalBooks = books.length

  const totalCopies = books.reduce(
    (total, book) =>
      total + Number(book.quantity),
    0
  )

  const lowStockBooks = books.filter(
    book => Number(book.quantity) < 2
  ).length


  // =========================================================
  // BOOK FUNCTIONS
  // =========================================================

  function addBook(e) {
    e.preventDefault()

    if (
      !title.trim() ||
      !author.trim() ||
      !genre.trim() ||
      !isbn.trim() ||
      quantity === ''
    ) {
      alert('Please complete all book details.')
      return
    }

    const newBook = {
      id: Date.now(),
      title: title.trim(),
      author: author.trim(),
      genre: genre.trim(),
      isbn: isbn.trim(),
      quantity: Number(quantity)
    }

    setBooks([
      ...books,
      newBook
    ])

    setTitle('')
    setAuthor('')
    setGenre('')
    setIsbn('')
    setQuantity('')
  }


  function editBook(book) {

    setEditingId(book.id)

    setTitle(book.title)
    setAuthor(book.author)
    setGenre(book.genre)
    setIsbn(book.isbn)
    setQuantity(book.quantity)
  }


  function updateBook(e) {
    e.preventDefault()

    if (
      !title.trim() ||
      !author.trim() ||
      !genre.trim() ||
      !isbn.trim() ||
      quantity === ''
    ) {
      alert('Please complete all book details.')
      return
    }

    setBooks(
      books.map(book =>
        book.id === editingId
          ? {
              ...book,
              title: title.trim(),
              author: author.trim(),
              genre: genre.trim(),
              isbn: isbn.trim(),
              quantity: Number(quantity)
            }
          : book
      )
    )

    cancelBookEdit()
  }


  function deleteBook(id) {

    const book = books.find(
      book => book.id === id
    )

    if (!book) return

    const confirmed = window.confirm(
      `Are you sure you want to delete "${book.title}"?`
    )

    if (!confirmed) return

    setBooks(
      books.filter(book => book.id !== id)
    )
  }


  function cancelBookEdit() {

    setEditingId(null)

    setTitle('')
    setAuthor('')
    setGenre('')
    setIsbn('')
    setQuantity('')
  }


  // =========================================================
  // STOCK
  // =========================================================

  function addStock(id) {

    const book = books.find(
      book => book.id === id
    )

    if (!book) return

    setBooks(
      books.map(book =>
        book.id === id
          ? {
              ...book,
              quantity:
                Number(book.quantity) + 1
            }
          : book
      )
    )

    setTransactions([
      ...transactions,
      {
        id: Date.now(),
        bookTitle: book.title,
        type: 'Stock Added',
        quantity: 1,
        date: new Date().toLocaleString()
      }
    ])
  }


  // =========================================================
  // BORROW BOOK
  // =========================================================

  function borrowBook(id) {

    const book = books.find(
      book => book.id === id
    )

    if (!book) return

    if (Number(book.quantity) <= 0) {

      alert(
        'This book is currently out of stock.'
      )

      return
    }

    setBooks(
      books.map(book =>
        book.id === id
          ? {
              ...book,
              quantity:
                Number(book.quantity) - 1
            }
          : book
      )
    )

    setTransactions([
      ...transactions,
      {
        id: Date.now(),
        bookTitle: book.title,
        type: 'Borrowed',
        quantity: 1,
        borrower:
          loggedInUser?.name || 'Unknown',
        membershipId:
          loggedInUser?.membershipId || '',
        date: new Date().toLocaleString()
      }
    ])

    alert(
      `"${book.title}" has been borrowed successfully.`
    )
  }


  // =========================================================
  // USER FUNCTIONS
  // =========================================================

  function addUser(e) {

    e.preventDefault()

    if (
      !name.trim() ||
      !membershipId.trim()
    ) {
      alert(
        'Please complete all user details.'
      )

      return
    }

    const membershipExists =
      users.some(
        user =>
          user.membershipId.toLowerCase() ===
          membershipId.trim().toLowerCase()
      )

    if (membershipExists) {

      alert(
        'This membership ID already exists.'
      )

      return
    }

    const newUser = {
      id: Date.now(),
      name: name.trim(),
      membershipId:
        membershipId.trim(),
      role
    }

    setUsers([
      ...users,
      newUser
    ])

    setName('')
    setMembershipId('')
    setRole('Member')
  }


  function editUser(user) {

    setEditingUserId(user.id)

    setName(user.name)
    setMembershipId(
      user.membershipId
    )
    setRole(user.role)

    setActiveSection('users')
  }


  function updateUser(e) {

    e.preventDefault()

    if (
      !name.trim() ||
      !membershipId.trim()
    ) {

      alert(
        'Please complete all user details.'
      )

      return
    }

    const membershipExists =
      users.some(
        user =>
          user.id !== editingUserId &&
          user.membershipId.toLowerCase() ===
          membershipId.trim().toLowerCase()
      )

    if (membershipExists) {

      alert(
        'This membership ID already exists.'
      )

      return
    }

    const updatedUser = {
      id: editingUserId,
      name: name.trim(),
      membershipId:
        membershipId.trim(),
      role
    }

    setUsers(
      users.map(user =>
        user.id === editingUserId
          ? updatedUser
          : user
      )
    )

    if (
      loggedInUser?.id === editingUserId
    ) {
      setLoggedInUser(updatedUser)
    }

    cancelUserEdit()
  }


  function deleteUser(id) {

    const user = users.find(
      user => user.id === id
    )

    if (!user) return

    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${user.name}"?`
      )

    if (!confirmed) return

    setUsers(
      users.filter(
        user => user.id !== id
      )
    )

    if (
      loggedInUser?.id === id
    ) {

      setLoggedInUser(null)
      setActiveSection('login')
    }
  }


  function cancelUserEdit() {

    setEditingUserId(null)

    setName('')
    setMembershipId('')
    setRole('Member')
  }


  // =========================================================
  // LOGIN
  // =========================================================

  function loginUser(e) {

    e.preventDefault()

    if (!loginId.trim()) {

      alert(
        'Please enter your membership ID.'
      )

      return
    }

    const user = users.find(
      user =>
        user.membershipId.toLowerCase() ===
        loginId.trim().toLowerCase()
    )

    if (!user) {

      alert(
        'User not found. Please check your membership ID.'
      )

      return
    }

    setLoggedInUser(user)

    setLoginId('')

    // Everyone starts on Dashboard
    setActiveSection('dashboard')
  }


  // =========================================================
  // LOGOUT
  // =========================================================

  function logoutUser() {

    setLoggedInUser(null)

    setLoginId('')

    setActiveSection('login')
  }


  // =========================================================
  // ROLE CHECKS
  // =========================================================

  const isAdmin =
    loggedInUser?.role === 'Admin'

  const isMember =
    loggedInUser?.role === 'Member'


  // =========================================================
  // BACKGROUND STYLE
  // =========================================================

const backgroundStyle = {
  backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.78), rgba(15, 23, 42, 0.78)), url('${import.meta.env.BASE_URL}library-bg.jpg')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed',
  minHeight: '100vh',
}


  // =========================================================
  // LOGIN SCREEN
  // =========================================================

  if (!loggedInUser) {

    return (

      <div
        className="app"
        style={backgroundStyle}
      >

        <main className="login-page">

          <div className="login-card">

            <div className="login-logo">
              📚
            </div>

            <h1>
              Library Management System
            </h1>

            <p className="login-subtitle">
              Sign in to access your library account
            </p>

            <form onSubmit={loginUser}>

              <label>
                Membership ID
              </label>

              <input
                type="text"
                value={loginId}
                onChange={e =>
                  setLoginId(
                    e.target.value
                  )
                }
                placeholder="Enter membership ID"
              />

              <button type="submit">
                🔐 Sign In
              </button>

            </form>

            <div className="login-footer">

              <p>
                Welcome to the Library
              </p>

              <small>
                Use your registered membership ID
                to continue.
              </small>

            </div>

          </div>

        </main>

      </div>
    )
  }


  // =========================================================
  // MAIN APPLICATION
  // =========================================================

  return (

    <div
      className="app"
      style={backgroundStyle}
    >

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="header">

        <div className="header-top">

          <div>

            <span className="eyebrow">
              LIBRARY MANAGEMENT SYSTEM
            </span>

            <h1>
              📚 Library Management System
            </h1>

            <p>
              Manage books, members and library
              activity.
            </p>

          </div>


          {/* LOGGED-IN USER */}

          <div className="logged-user">

            <div className="user-avatar">

              {loggedInUser.name
                .charAt(0)
                .toUpperCase()}

            </div>

            <div>

              <strong>
                {loggedInUser.name}
              </strong>

              <small>
                {loggedInUser.role}
              </small>

            </div>

            <button
              className="logout-button"
              onClick={logoutUser}
            >
              🚪 Logout
            </button>

          </div>

        </div>


        {/* ===================================================
            NAVIGATION
        =================================================== */}

        <nav className="nav">

          {/* DASHBOARD
              ADMIN + MEMBER
          */}

          <button
            className={
              activeSection === 'dashboard'
                ? 'active'
                : ''
            }
            onClick={() =>
              setActiveSection(
                'dashboard'
              )
            }
          >
            🏠 Dashboard
          </button>


          {/* =================================================
              ADMIN NAVIGATION
          ================================================= */}

          {isAdmin && (

            <>

              <button
                className={
                  activeSection === 'books'
                    ? 'active'
                    : ''
                }
                onClick={() =>
                  setActiveSection(
                    'books'
                  )
                }
              >
                📚 Books
              </button>


              <button
                className={
                  activeSection === 'users'
                    ? 'active'
                    : ''
                }
                onClick={() =>
                  setActiveSection(
                    'users'
                  )
                }
              >
                👥 User Management
              </button>


              <button
                className={
                  activeSection ===
                  'transactions'
                    ? 'active'
                    : ''
                }
                onClick={() =>
                  setActiveSection(
                    'transactions'
                  )
                }
              >
                🔄 Transactions
              </button>

            </>

          )}


          {/* =================================================
              MEMBER NAVIGATION
          ================================================= */}

          {isMember && (

            <button
              className={
                activeSection ===
                'borrow'
                  ? 'active'
                  : ''
              }
              onClick={() =>
                setActiveSection(
                  'borrow'
                )
              }
            >
              📖 Borrow Books
            </button>

          )}

        </nav>

      </header>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="container">


        {/* ===================================================
            DASHBOARD
        =================================================== */}

        {activeSection === 'dashboard' && (

          <section className="dashboard-page">

            <div className="page-heading">

              <span className="eyebrow">
                {isAdmin
                  ? 'ADMINISTRATOR DASHBOARD'
                  : 'MEMBER DASHBOARD'}
              </span>

              <h2>
                Welcome, {loggedInUser.name} 👋
              </h2>

              <p>
                {isAdmin
                  ? 'Manage your entire library from one place.'
                  : 'Browse available books and borrow what you need.'}
              </p>

            </div>


            {/* STATISTICS */}

            <div className="dashboard">

              <div className="stat-card">

                <div className="stat-icon">
                  📚
                </div>

                <div>

                  <h3>
                    Total Books
                  </h3>

                  <p>
                    {totalBooks}
                  </p>

                </div>

              </div>


              <div className="stat-card">

                <div className="stat-icon">
                  📦
                </div>

                <div>

                  <h3>
                    Total Copies
                  </h3>

                  <p>
                    {totalCopies}
                  </p>

                </div>

              </div>


              {/* ADMIN ONLY */}

              {isAdmin && (

                <div className="stat-card low-stock">

                  <div className="stat-icon">
                    ⚠️
                  </div>

                  <div>

                    <h3>
                      Low Stock
                    </h3>

                    <p>
                      {lowStockBooks}
                    </p>

                  </div>

                </div>

              )}

            </div>


            {/* =================================================
                ADMIN DASHBOARD
            ================================================= */}

            {isAdmin && (

              <>

                {/* LOW STOCK */}

                {lowStockBooks > 0 && (

                  <div className="panel dashboard-panel">

                    <div className="section-heading">

                      <div>

                        <span className="eyebrow">
                          INVENTORY ALERT
                        </span>

                        <h2>
                          ⚠️ Books Running Low
                        </h2>

                      </div>

                      <span className="status-badge warning">
                        Needs Attention
                      </span>

                    </div>


                    <div className="low-stock-grid">

                      {books
                        .filter(
                          book =>
                            Number(book.quantity) < 2
                        )
                        .map(book => (

                          <div
                            key={book.id}
                            className="low-stock-book"
                          >

                            <h3>
                              {book.title}
                            </h3>

                            <p>
                              {book.author}
                            </p>

                            <div className="stock-warning">

                              <span>
                                Copies remaining
                              </span>

                              <strong>
                                {book.quantity}
                              </strong>

                            </div>

                          </div>

                        ))}

                    </div>

                  </div>

                )}


                {/* QUICK ACTIONS */}

                <div className="panel dashboard-panel">

                  <div className="section-heading">

                    <div>

                      <span className="eyebrow">
                        ADMIN TOOLS
                      </span>

                      <h2>
                        ⚡ Quick Actions
                      </h2>

                    </div>

                  </div>


                  <div className="quick-actions">

                    <button
                      onClick={() =>
                        setActiveSection(
                          'books'
                        )
                      }
                    >

                      <span>
                        📚
                      </span>

                      <div>

                        <strong>
                          Manage Books
                        </strong>

                        <small>
                          Add, edit and manage books
                        </small>

                      </div>

                    </button>


                    <button
                      onClick={() =>
                        setActiveSection(
                          'users'
                        )
                      }
                    >

                      <span>
                        👥
                      </span>

                      <div>

                        <strong>
                          Manage Users
                        </strong>

                        <small>
                          Register and manage members
                        </small>

                      </div>

                    </button>


                    <button
                      onClick={() =>
                        setActiveSection(
                          'transactions'
                        )
                      }
                    >

                      <span>
                        🔄
                      </span>

                      <div>

                        <strong>
                          Transactions
                        </strong>

                        <small>
                          View library activity
                        </small>

                      </div>

                    </button>

                  </div>

                </div>

              </>

            )}


            {/* =================================================
                MEMBER DASHBOARD
            ================================================= */}

            {isMember && (

              <div className="panel dashboard-panel">

                <div className="section-heading">

                  <div>

                    <span className="eyebrow">
                      MEMBER SERVICES
                    </span>

                    <h2>
                      📖 What would you like to do?
                    </h2>

                  </div>

                </div>


                <div className="quick-actions">

                  <button
                    onClick={() =>
                      setActiveSection(
                        'borrow'
                      )
                    }
                  >

                    <span>
                      📚
                    </span>

                    <div>

                      <strong>
                        Browse & Borrow Books
                      </strong>

                      <small>
                        View available books and borrow
                        a copy.
                      </small>

                    </div>

                  </button>

                </div>

              </div>

            )}


            {/* RECENT TRANSACTIONS FOR ADMIN */}

            {isAdmin &&
              transactions.length > 0 && (

              <div className="panel dashboard-panel">

                <div className="section-heading">

                  <div>

                    <span className="eyebrow">
                      RECENT ACTIVITY
                    </span>

                    <h2>
                      🔄 Recent Transactions
                    </h2>

                  </div>

                  <button
                    className="text-button"
                    onClick={() =>
                      setActiveSection(
                        'transactions'
                      )
                    }
                  >
                    View all →
                  </button>

                </div>


                <div className="transaction-list">

                  {transactions
                    .slice()
                    .reverse()
                    .slice(0, 5)
                    .map(transaction => (

                      <div
                        key={transaction.id}
                        className="transaction"
                      >

                        <div className="transaction-icon">

                          {transaction.type ===
                          'Borrowed'
                            ? '📖'
                            : '📦'}

                        </div>


                        <div className="transaction-info">

                          <h3>
                            {transaction.bookTitle}
                          </h3>

                          <p>

                            <span
                              className={
                                transaction.type ===
                                'Borrowed'
                                  ? 'transaction-type borrowed'
                                  : 'transaction-type stock'
                              }
                            >
                              {transaction.type}
                            </span>

                            <span>
                              Quantity:{' '}
                              {transaction.quantity}
                            </span>

                          </p>

                          {transaction.borrower && (

                            <p>
                              Borrowed by:{' '}
                              {transaction.borrower}
                            </p>

                          )}

                        </div>


                        <span className="transaction-date">
                          {transaction.date}
                        </span>

                      </div>

                    ))}

                </div>

              </div>

            )}

          </section>

        )}


        {/* ===================================================
            ADMIN BOOK MANAGEMENT
        =================================================== */}

        {isAdmin &&
          activeSection === 'books' && (

          <>

            <section className="panel">

              <div className="page-heading">

                <span className="eyebrow">
                  ADMINISTRATION
                </span>

                <h2>
                  📚 Book Management
                </h2>

                <p>
                  Add, edit, delete and manage library
                  books.
                </p>

              </div>


              <form
                onSubmit={
                  editingId
                    ? updateBook
                    : addBook
                }
              >

                <label>
                  Book Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={e =>
                    setTitle(
                      e.target.value
                    )
                  }
                  placeholder="Enter book title"
                />


                <label>
                  Author
                </label>

                <input
                  type="text"
                  value={author}
                  onChange={e =>
                    setAuthor(
                      e.target.value
                    )
                  }
                  placeholder="Enter author"
                />


                <label>
                  Genre
                </label>

                <input
                  type="text"
                  value={genre}
                  onChange={e =>
                    setGenre(
                      e.target.value
                    )
                  }
                  placeholder="Enter genre"
                />


                <label>
                  ISBN
                </label>

                <input
                  type="text"
                  value={isbn}
                  onChange={e =>
                    setIsbn(
                      e.target.value
                    )
                  }
                  placeholder="Enter ISBN"
                />


                <label>
                  Quantity
                </label>

                <input
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={e =>
                    setQuantity(
                      e.target.value
                    )
                  }
                  placeholder="Enter quantity"
                />


                <button type="submit">

                  {editingId
                    ? '✏️ Update Book'
                    : '➕ Add Book'}

                </button>


                {editingId && (

                  <button
                    type="button"
                    onClick={
                      cancelBookEdit
                    }
                  >
                    Cancel
                  </button>

                )}

              </form>

            </section>


            {/* CURRENT BOOKS */}

            <section className="panel">

              <div className="section-heading">

                <div>

                  <span className="eyebrow">
                    LIBRARY COLLECTION
                  </span>

                  <h2>
                    📖 Current Books
                  </h2>

                </div>

                <span className="status-badge">

                  {books.length}{' '}

                  {books.length !== 1
                    ? 'Books'
                    : 'Book'}

                </span>

              </div>


              {books.length === 0 ? (

                <p>
                  No books have been added yet.
                </p>

              ) : (

                <div className="book-list">

                  {books.map(book => (

                    <div
                      className={`book-card ${
                        Number(book.quantity) < 2
                          ? 'low-stock-book'
                          : ''
                      }`}
                      key={book.id}
                    >

                      <h3>
                        {book.title}
                      </h3>

                      <p>
                        <strong>
                          Author:
                        </strong>{' '}
                        {book.author}
                      </p>

                      <p>
                        <strong>
                          Genre:
                        </strong>{' '}
                        {book.genre}
                      </p>

                      <p>
                        <strong>
                          ISBN:
                        </strong>{' '}
                        {book.isbn}
                      </p>

                      <p>
                        <strong>
                          Quantity:
                        </strong>{' '}
                        {book.quantity}
                      </p>


                      {Number(book.quantity) < 2 && (

                        <p>
                          ⚠️ Low stock
                        </p>

                      )}


                      <div className="button-group">

                        <button
                          onClick={() =>
                            editBook(book)
                          }
                        >
                          ✏️ Edit
                        </button>


                        <button
                          onClick={() =>
                            deleteBook(
                              book.id
                            )
                          }
                        >
                          🗑️ Delete
                        </button>


                        <button
                          onClick={() =>
                            addStock(
                              book.id
                            )
                          }
                        >
                          ➕ Add Stock
                        </button>


                        <button
                          onClick={() =>
                            borrowBook(
                              book.id
                            )
                          }
                        >
                          📖 Borrow
                        </button>

                      </div>

                    </div>

                  ))}

                </div>

              )}

            </section>

          </>

        )}


        {/* ===================================================
            MEMBER BORROW BOOKS
        =================================================== */}

        {isMember &&
          activeSection === 'borrow' && (

          <section className="panel">

            <div className="page-heading">

              <span className="eyebrow">
                MEMBER SERVICES
              </span>

              <h2>
                📖 Borrow Books
              </h2>

              <p>
                Browse the library collection and borrow
                available books.
              </p>

            </div>


            {books.length === 0 ? (

              <div className="empty-state">

                <div>
                  📚
                </div>

                <h3>
                  No Books Available
                </h3>

                <p>
                  The library has not added any books yet.
                </p>

              </div>

            ) : (

              <div className="book-list">

                {books.map(book => (

                  <div
                    className="book-card"
                    key={book.id}
                  >

                    <h3>
                      {book.title}
                    </h3>

                    <p>
                      <strong>
                        Author:
                      </strong>{' '}
                      {book.author}
                    </p>

                    <p>
                      <strong>
                        Genre:
                      </strong>{' '}
                      {book.genre}
                    </p>

                    <p>
                      <strong>
                        ISBN:
                      </strong>{' '}
                      {book.isbn}
                    </p>


                    <div className="stock-display">

                      <span>
                        Available Copies
                      </span>

                      <strong>
                        {book.quantity}
                      </strong>

                    </div>


                    {Number(book.quantity) > 0 ? (

                      <button
                        onClick={() =>
                          borrowBook(
                            book.id
                          )
                        }
                      >
                        📖 Borrow Book
                      </button>

                    ) : (

                      <button
                        disabled
                      >
                        ❌ Out of Stock
                      </button>

                    )}

                  </div>

                ))}

              </div>

            )}

          </section>

        )}


        {/* ===================================================
            ADMIN USER MANAGEMENT
        =================================================== */}

        {isAdmin &&
          activeSection === 'users' && (

          <section className="panel">

            <div className="page-heading">

              <span className="eyebrow">
                ADMINISTRATION
              </span>

              <h2>
                👥 User Management
              </h2>

              <p>
                Create and manage library member accounts.
              </p>

            </div>


            {/* USER FORM */}

            <div className="user-section">

              <h3>

                {editingUserId
                  ? '✏️ Edit User'
                  : '➕ Add New User'}

              </h3>


              <form
                onSubmit={
                  editingUserId
                    ? updateUser
                    : addUser
                }
              >

                <label>
                  Full Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={e =>
                    setName(
                      e.target.value
                    )
                  }
                  placeholder="Enter full name"
                />


                <label>
                  Membership ID
                </label>

                <input
                  type="text"
                  value={membershipId}
                  onChange={e =>
                    setMembershipId(
                      e.target.value
                    )
                  }
                  placeholder="Enter membership ID"
                />


                <label>
                  Role
                </label>

                <select
                  value={role}
                  onChange={e =>
                    setRole(
                      e.target.value
                    )
                  }
                >

                  <option value="Member">
                    Member
                  </option>

                  <option value="Admin">
                    Admin
                  </option>

                </select>


                <button type="submit">

                  {editingUserId
                    ? '✏️ Update User'
                    : '➕ Add User'}

                </button>


                {editingUserId && (

                  <button
                    type="button"
                    onClick={
                      cancelUserEdit
                    }
                  >
                    Cancel
                  </button>

                )}

              </form>

            </div>


            {/* REGISTERED USERS */}

            <div className="user-section">

              <div className="section-heading">

                <div>

                  <span className="eyebrow">
                    REGISTERED ACCOUNTS
                  </span>

                  <h3>
                    👤 Library Users
                  </h3>

                </div>

                <span className="status-badge">

                  {users.length}{' '}

                  {users.length !== 1
                    ? 'Users'
                    : 'User'}

                </span>

              </div>


              {users.length === 0 ? (

                <p>
                  No users have been registered yet.
                </p>

              ) : (

                <div className="user-list">

                  {users.map(user => (

                    <div
                      className="user-card"
                      key={user.id}
                    >

                      <div>

                        <h3>
                          {user.name}
                        </h3>

                        <p>
                          <strong>
                            Membership ID:
                          </strong>{' '}
                          {user.membershipId}
                        </p>

                        <p>
                          <strong>
                            Role:
                          </strong>{' '}
                          {user.role}
                        </p>

                      </div>


                      <div className="button-group">

                        <button
                          onClick={() =>
                            editUser(
                              user
                            )
                          }
                        >
                          ✏️ Edit
                        </button>


                        <button
                          className="delete"
                          onClick={() =>
                            deleteUser(
                              user.id
                            )
                          }
                        >
                          🗑️ Delete
                        </button>

                      </div>

                    </div>

                  ))}

                </div>

              )}

            </div>

          </section>

        )}


        {/* ===================================================
            ADMIN TRANSACTIONS
        =================================================== */}

        {isAdmin &&
          activeSection ===
            'transactions' && (

          <section className="panel">

            <div className="page-heading">

              <span className="eyebrow">
                ADMINISTRATION
              </span>

              <h2>
                🔄 Transactions
              </h2>

              <p>
                View all book borrowing and stock activity.
              </p>

            </div>


            {transactions.length === 0 ? (

              <div className="empty-state">

                <div>
                  🔄
                </div>

                <h3>
                  No Transactions
                </h3>

                <p>
                  Transactions will appear here when
                  books are borrowed or stock is added.
                </p>

              </div>

            ) : (

              <div className="transaction-list">

                {transactions
                  .slice()
                  .reverse()
                  .map(transaction => (

                    <div
                      className="transaction"
                      key={transaction.id}
                    >

                      <div className="transaction-icon">

                        {transaction.type ===
                        'Borrowed'
                          ? '📖'
                          : '📦'}

                      </div>


                      <div className="transaction-info">

                        <h3>
                          {transaction.bookTitle}
                        </h3>


                        <p>

                          <span
                            className={
                              transaction.type ===
                              'Borrowed'
                                ? 'transaction-type borrowed'
                                : 'transaction-type stock'
                            }
                          >
                            {transaction.type}
                          </span>

                        </p>


                        <p>
                          <strong>
                            Quantity:
                          </strong>{' '}
                          {transaction.quantity}
                        </p>


                        {transaction.borrower && (

                          <p>
                            <strong>
                              Borrowed by:
                            </strong>{' '}
                            {transaction.borrower}
                            {' '}
                            ({transaction.membershipId})
                          </p>

                        )}


                        <p>
                          <strong>
                            Date:
                          </strong>{' '}
                          {transaction.date}
                        </p>

                      </div>

                    </div>

                  ))}

              </div>

            )}

          </section>

        )}

      </main>

    </div>
  )
}

export default App