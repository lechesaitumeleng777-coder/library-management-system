function Transactions({
  books,
  addStock,
  borrowBook,
  transactions
}) {
  return (
    <main className="container">

      {/* Stock Management */}
      <section className="panel">
        <h2>🔄 Stock Management</h2>

        {books.length === 0 ? (
          <p className="empty">
            No books available. Add books first.
          </p>
        ) : (
          <div className="transaction-books">
            {books.map(book => (
              <div className="transaction-book" key={book.id}>
                
                <div>
                  <h3>{book.title}</h3>
                  <p>Author: {book.author}</p>
                  <p>
                    Available Copies: <strong>{book.quantity}</strong>
                  </p>
                </div>

                <div className="transaction-actions">
                  <button
                    type="button"
                    onClick={() => addStock(book.id)}
                  >
                    ➕ Add Stock
                  </button>

                  <button
                    type="button"
                    className="borrow"
                    onClick={() => borrowBook(book.id)}
                  >
                    📖 Deduct Stock
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </section>


      {/* Transaction History */}
      <section className="panel transaction-panel">
        <h2>📋 Transaction History</h2>

        {transactions.length === 0 ? (
          <p className="empty">
            No transactions yet.
          </p>
        ) : (
          <div className="transaction-list">
            {transactions.map(transaction => (
              <div
                className="transaction"
                key={transaction.id}
              >
                <div>
                  <h3>{transaction.bookTitle}</h3>
                  <p>Action: {transaction.type}</p>
                  <p>Quantity: {transaction.quantity}</p>
                </div>

                <div>
                  <p>{transaction.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </main>
  )
}

export default Transactions