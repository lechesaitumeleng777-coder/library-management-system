function Dashboard({ books }) {
  const totalBooks = books.length

  const totalCopies = books.reduce(
    (total, book) => total + book.quantity,
    0
  )

  const lowStockBooks = books.filter(
    book => book.quantity < 2
  ).length

  return (
    <section className="dashboard">
      <div className="stat-card">
        <h3>📚 Total Books</h3>
        <p>{totalBooks}</p>
      </div>

      <div className="stat-card">
        <h3>📦 Total Copies</h3>
        <p>{totalCopies}</p>
      </div>

      <div className="stat-card low-stock">
        <h3>⚠️ Low Stock</h3>
        <p>{lowStockBooks}</p>
      </div>
    </section>
  )
}

export default Dashboard