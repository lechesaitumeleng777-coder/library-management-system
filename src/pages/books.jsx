function Books({
  books,
  title,
  author,
  genre,
  isbn,
  quantity,
  editingId,
  setTitle,
  setAuthor,
  setGenre,
  setIsbn,
  setQuantity,
  addBook,
  updateBook,
  editBook,
  deleteBook,
  addStock,
  borrowBook
}) {
  return (
    <main className="container">
      <section className="panel">
        <h2>{editingId ? 'Update Book' : 'Add a New Book'}</h2>

        <form onSubmit={editingId ? updateBook : addBook}>
          <label>Book Title</label>
          <input
            type="text"
            placeholder="Enter book title"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />

          <label>Author</label>
          <input
            type="text"
            placeholder="Enter author's name"
            value={author}
            onChange={e => setAuthor(e.target.value)}
          />

          <label>Genre</label>
          <input
            type="text"
            placeholder="Enter book genre"
            value={genre}
            onChange={e => setGenre(e.target.value)}
          />

          <label>ISBN</label>
          <input
            type="text"
            placeholder="Enter ISBN"
            value={isbn}
            onChange={e => setIsbn(e.target.value)}
          />

          <label>Initial Quantity</label>
          <input
            type="number"
            min="1"
            placeholder="Enter quantity"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
          />

          <button type="submit">
            {editingId ? 'Update Book' : '+ Add Book'}
          </button>
        </form>
      </section>

      <section className="panel">
        <h2>Book Collection ({books.length})</h2>

        {books.length === 0 ? (
          <p className="empty">
            No books yet. Add your first book!
          </p>
        ) : (
          <div className="book-list">
            {books.map(book => (
              <div
                className={`book ${
                  book.quantity < 2 ? 'low-stock-book' : ''
                }`}
                key={book.id}
              >
                <div>
                  <h3>{book.title}</h3>
                  <p>By {book.author}</p>
                  <p>Genre: {book.genre}</p>
                  <p>ISBN: {book.isbn}</p>
                  <p>Available: {book.quantity}</p>
                </div>

                <div>
                  <button onClick={() => editBook(book)}>
                    Edit
                  </button>

                  <button
                    className="delete"
                    onClick={() => deleteBook(book.id)}
                  >
                    Delete
                  </button>

                  <div>
                    <button onClick={() => addStock(book.id)}>
                      + Add Stock
                    </button>

                    <button onClick={() => borrowBook(book.id)}>
                      - Borrow
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default Books