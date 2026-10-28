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


const [books, setBooks] = useState([])
const [booksLoading, setBooksLoading] = useState(true)

useEffect(() => {
  const fetchBooks = async () => {
    try {
      const response = await fetch('http://localhost:5000/books')

      if (!response.ok) {
        throw new Error('Failed to fetch books')
      }

      const data = await response.json()
      setBooks(data)
    } catch (error) {
      console.error('Error loading books:', error)
      alert('Could not load books from the database.')
    } finally {
      setBooksLoading(false)
    }
  }

  fetchBooks()
}, [])


  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [genre, setGenre] = useState('')
  const [isbn, setIsbn] = useState('')
  const [quantity, setQuantity] = useState('')
  const [editingId, setEditingId] = useState(null)


  // =========================================================
  // USERS
  // =========================================================

 
const [users, setUsers] = useState([])

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
      'users',
      JSON.stringify(users)
    )
  }, [users])


useEffect(() => {
  async function loadTransactions() {
    try {
      const response = await fetch(
        'http://localhost:5000/transactions'
      )

      if (!response.ok) {
        throw new Error('Failed to load transactions')
      }

      const data = await response.json()

      setTransactions(data.map(item => ({
        id: item.id,
        bookTitle: item.book_title,
        type: item.transaction_type,
        quantity: item.quantity,
        borrower: item.borrower_name,
        membershipId: item.user_id || '',
        date: item.transaction_date
          ? new Date(item.transaction_date).toLocaleString()
          : ''
      })))
    } catch (error) {
      console.error('Error loading transactions:', error)
    }
  }

  loadTransactions()
}, [])

useEffect(() => {
  async function loadUsers() {
    try {
      const response = await fetch('http://localhost:5000/users')

      if (!response.ok) {
        throw new Error('Failed to load users')
      }

      const data = await response.json()

      setUsers(data.map(user => ({
        id: user.id,
        name: user.name,
        membershipId: user.membership_id,
        role: user.role
      })))
    } catch (error) {
      console.error('Error loading users:', error)
      alert('Could not load users from the database.')
    }
  }

  loadUsers()
}, [])


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
  // API HELPER
  // =========================================================

  async function getApiError(response, fallbackMessage) {
    try {
      const data = await response.json()
      return data.message || data.error || fallbackMessage
    } catch {
      return fallbackMessage
    }
  }


  // =========================================================
  // BOOK FUNCTIONS
  // =========================================================

  async function addBook(e) {
    e.preventDefault()

    if (!title.trim() || !author.trim() || !genre.trim() || !isbn.trim() || quantity === '') {
      alert('Please complete all book details.')
      return
    }

    const parsedQuantity = Number(quantity)
    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 0) {
      alert('Quantity must be a whole number that is zero or greater.')
      return
    }

    try {
      const response = await fetch('http://localhost:5000/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          author: author.trim(),
          genre: genre.trim(),
          isbn: isbn.trim(),
          quantity: parsedQuantity
        })
      })

      if (!response.ok) {
        throw new Error(await getApiError(response, 'Could not add the book.'))
      }

      const booksResponse = await fetch('http://localhost:5000/books')
      if (!booksResponse.ok) throw new Error('Book was added, but the list could not be refreshed.')
      setBooks(await booksResponse.json())

      setTitle('')
      setAuthor('')
      setGenre('')
      setIsbn('')
      setQuantity('')
      alert('Book added successfully.')
    } catch (error) {
      console.error('Error adding book:', error)
      alert(error.message || 'Could not add the book. Make sure the backend and MySQL are running.')
    }
  }


  function editBook(book) {

    setEditingId(book.id)

    setTitle(book.title)
    setAuthor(book.author)
    setGenre(book.genre)
    setIsbn(book.isbn)
    setQuantity(book.quantity)
  }


  async function updateBook(e) {
    e.preventDefault()

    if (!title.trim() || !author.trim() || !genre.trim() || !isbn.trim() || quantity === '') {
      alert('Please complete all book details.')
      return
    }

    const parsedQuantity = Number(quantity)
    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 0) {
      alert('Quantity must be a whole number that is zero or greater.')
      return
    }

    try {
      const response = await fetch(`http://localhost:5000/books/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          author: author.trim(),
          genre: genre.trim(),
          isbn: isbn.trim(),
          quantity: parsedQuantity
        })
      })

      if (!response.ok) throw new Error(await getApiError(response, 'Could not update the book.'))

      const booksResponse = await fetch('http://localhost:5000/books')
      if (!booksResponse.ok) throw new Error('Book was updated, but the list could not be refreshed.')
      setBooks(await booksResponse.json())
      cancelBookEdit()
      alert('Book updated successfully.')
    } catch (error) {
      console.error('Error updating book:', error)
      alert(error.message || 'Could not update the book. Make sure the backend and MySQL are running.')
    }
  }


  async function deleteBook(id) {
    const book = books.find(book => book.id === id)
    if (!book) return

    const confirmed = window.confirm(`Are you sure you want to delete "${book.title}"?`)
    if (!confirmed) return

    try {
      const response = await fetch(`http://localhost:5000/books/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error(await getApiError(response, 'Could not delete the book.'))
      setBooks(currentBooks => currentBooks.filter(item => item.id !== id))
      if (editingId === id) cancelBookEdit()
      alert('Book deleted successfully.')
    } catch (error) {
      console.error('Error deleting book:', error)
      alert(error.message || 'Could not delete the book. Make sure the backend and MySQL are running.')
    }
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


async function addStock(id) {
  const book = books.find(book => book.id === id)
  if (!book) return

  try {
    // 1. Update the quantity in MySQL
    const response = await fetch(
      `http://localhost:5000/books/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: book.title,
          author: book.author,
          genre: book.genre || '',
          isbn: book.isbn || '',
          quantity: Number(book.quantity) + 1
        })
      }
    )

    if (!response.ok) {
      throw new Error(
        await getApiError(response, 'Could not add stock.')
      )
    }

    // 2. Save the stock transaction in MySQL
    const transactionResponse = await fetch(
      'http://localhost:5000/transactions',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction_type: 'Stock Added',
          book_id: id,
          book_title: book.title,
          user_id: null,
          borrower_name: loggedInUser?.name || 'Unknown',
          quantity: 1
        })
      }
    )

    if (!transactionResponse.ok) {
      throw new Error(
        'Stock quantity updated, but the transaction could not be saved.'
      )
    }

    // 3. Refresh the books from MySQL
    const booksResponse = await fetch(
      'http://localhost:5000/books'
    )

    if (!booksResponse.ok) {
      throw new Error(
        'Stock was updated, but the book list could not refresh.'
      )
    }

    setBooks(await booksResponse.json())

    // 4. Refresh the transaction history from MySQL
    const transactionsResponse = await fetch(
      'http://localhost:5000/transactions'
    )

    if (!transactionsResponse.ok) {
      throw new Error(
        'Stock was updated, but transaction history could not refresh.'
      )
    }

    const data = await transactionsResponse.json()

    setTransactions(data.map(item => ({
      id: item.id,
      bookTitle: item.book_title,
      type: item.transaction_type,
      quantity: item.quantity,
      borrower: item.borrower_name,
      membershipId: item.user_id || '',
      date: item.transaction_date
        ? new Date(item.transaction_date).toLocaleString()
        : ''
    })))

    alert('Stock added and transaction saved successfully!')
  } catch (error) {
    console.error('Error adding stock:', error)
    alert(
      error.message ||
      'Could not add stock. Make sure the backend and MySQL are running.'
    )
  }
}



async function borrowBook(id) {
  const book = books.find(book => book.id === id)
  if (!book) return

  if (Number(book.quantity) <= 0) {
    alert('This book is currently out of stock.')
    return
  }

  try {
    // 1. Update the book quantity in MySQL
    const response = await fetch(
      `http://localhost:5000/books/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: book.title,
          author: book.author,
          genre: book.genre || '',
          isbn: book.isbn || '',
          quantity: Number(book.quantity) - 1
        })
      }
    )

    if (!response.ok) {
      throw new Error('Could not update the book quantity.')
    }

    // 2. Save the borrowing transaction in MySQL
    const transactionResponse = await fetch(
      'http://localhost:5000/transactions',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction_type: 'Borrowed',
          book_id: id,
          book_title: book.title,
          user_id: null,
          borrower_name: loggedInUser?.name || 'Unknown',
          quantity: 1
        })
      }
    )

    if (!transactionResponse.ok) {
      throw new Error(
        'The book quantity changed, but the borrowing record could not be saved. Check MySQL before trying again.'
      )
    }

    // 3. Refresh the books displayed on the website
    const booksResponse = await fetch(
      'http://localhost:5000/books'
    )

    if (!booksResponse.ok) {
      throw new Error(
        'Transaction saved, but the book list could not refresh.'
      )
    }

    setBooks(await booksResponse.json())

    // 4. Update the transaction history displayed in React
    setTransactions(current => [
      ...current,
      {
        id: Date.now(),
        bookTitle: book.title,
        type: 'Borrowed',
        quantity: 1,
        borrower: loggedInUser?.name || 'Unknown',
        membershipId: loggedInUser?.membershipId || '',
        date: new Date().toLocaleString()
      }
    ])

    alert(`"${book.title}" has been borrowed successfully.`)
  } catch (error) {
    console.error('Error borrowing book:', error)
    alert(error.message || 'Could not borrow the book.')
  }
}


async function addUser(e) {
  e.preventDefault()

  if (!name.trim() || !membershipId.trim()) {
    alert('Please complete all user details.')
    return
  }

  const membershipExists = users.some(
    user =>
      user.membershipId.toLowerCase() ===
      membershipId.trim().toLowerCase()
  )

  if (membershipExists) {
    alert('This membership ID already exists.')
    return
  }

  try {
    const response = await fetch('http://localhost:5000/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: name.trim(),
        membershipId: membershipId.trim(),
        role
      })
    })

    const data = await response.json()

    if (!response.ok) {
      alert(data.message || 'Failed to add user.')
      return
    }

    const newUser = {
      id: data.id,
      name: name.trim(),
      membershipId: membershipId.trim(),
      role
    }

    setUsers(prevUsers => [...prevUsers, newUser])

    setName('')
    setMembershipId('')
    setRole('Member')

    alert('User added successfully!')
  } catch (error) {
    console.error('Error adding user:', error)
    alert('Could not connect to the server. Make sure your backend is running.')
  }
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

async function updateUser(e) {
  e.preventDefault()

  if (!name.trim() || !membershipId.trim()) {
    alert('Please complete all user details.')
    return
  }

  const membershipExists = users.some(
    user =>
      user.id !== editingUserId &&
      user.membershipId.toLowerCase() ===
        membershipId.trim().toLowerCase()
  )

  if (membershipExists) {
    alert('This membership ID already exists.')
    return
  }

  try {
    const response = await fetch(
      `http://localhost:5000/users/${editingUserId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          membershipId: membershipId.trim(),
          role
        })
      }
    )
const responseText = await response.text()
console.log('Backend response:', responseText)

let data

try {
  data = JSON.parse(responseText)
} catch {
  alert('The backend returned HTML instead of JSON. Check the browser Console.')
  return
}
  
    if (!response.ok) {
      alert(data.message || 'Could not update user.')
      return
    }

    const updatedUser = {
      id: Number(editingUserId),
      name: name.trim(),
      membershipId: membershipId.trim(),
      role
    }

    setUsers(users.map(user =>
      user.id === Number(editingUserId)
        ? updatedUser
        : user
    ))

    if (loggedInUser?.id === Number(editingUserId)) {
      setLoggedInUser(updatedUser)
    }

    alert('User updated successfully!')
    cancelUserEdit()
  } catch (error) {
  console.error('Update user error:', error)
  alert('Error: ' + error.message)
}
}

async function deleteUser(id) {
  const user = users.find(user => user.id === id)
  if (!user) return

  const confirmed = window.confirm(
    `Are you sure you want to delete "${user.name}"?`
  )

  if (!confirmed) return

  try {
    const response = await fetch(
      `http://localhost:5000/users/${id}`,
      { method: 'DELETE' }
    )

    const data = await response.json()

    if (!response.ok) {
      alert(data.message || 'Could not delete user.')
      return
    }

    setUsers(users.filter(user => user.id !== id))

    if (loggedInUser?.id === id) {
      setLoggedInUser(null)
      setActiveSection('login')
    }

    alert('User deleted successfully!')
  } catch (error) {
    alert('Could not connect to the backend.')
    console.error(error)
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