function Users({
  users,
  name,
  membershipId,
  role,
  setName,
  setMembershipId,
  setRole,
  addUser,
  deleteUser,
  loginId,
  setLoginId,
  loginUser,
  loggedInUser,
  setLoggedInUser,
    editingUserId,
  editUser,
  updateUser
}) {
  return (
    <main className="container">

      {/* User Login */}
      <section className="panel">
        <h2>🔐 User Login</h2>

        <form onSubmit={loginUser}>
          <label>Membership ID</label>

          <input
            type="text"
            placeholder="Enter membership ID"
            value={loginId}
            onChange={e => setLoginId(e.target.value)}
          />

          <button type="submit">Login </button>
        </form>

        {loggedInUser && (
          <div className="login-status">
            <h3>Welcome, {loggedInUser.name}! 👋</h3>
            <p>Role: {loggedInUser.role}</p>

            <button
              type="button"
              onClick={() => setLoggedInUser(null)}
            >
              Logout
            </button>
          </div>
        )}
      </section>


      {/* Add User */}
      <section className="panel">
        <h2>👥 Add User</h2>

          <form onSubmit={editingUserId ? updateUser : addUser}>
          <label>Full Name</label>

          <input
            type="text"
            placeholder="Enter user's name"
            value={name}
            onChange={e => setName(e.target.value)}
          />

          <label>Membership ID</label>

          <input
            type="text"
            placeholder="Enter membership ID"
            value={membershipId}
            onChange={e => setMembershipId(e.target.value)}
          />

          <label>Role</label>

          <select
            value={role}
            onChange={e => setRole(e.target.value)}
          >
            <option value="Member">Member</option>
            <option value="Admin">Admin</option>
          </select>

         <button type="submit">
  {editingUserId ? 'Update User' : '+ Add User'}
</button>
        </form>
      </section>


      {/* User List */}
      <section className="panel">
        <h2>User List ({users.length})</h2>

        {users.length === 0 ? (
          <p className="empty">
            No users yet. Add your first user!
          </p>
        ) : (
          <div className="user-list">
            {users.map(user => (
              <div className="user-card" key={user.id}>

                <div>
                  <h3>{user.name}</h3>
                  <p>Membership ID: {user.membershipId}</p>
                  <p>Role: {user.role}</p>
                </div>

               <button
  type="button"
  onClick={() => editUser(user)}
>
  ✏️ Edit
</button>

<button
  type="button"
  className="delete"
  onClick={() => deleteUser(user.id)}
>
  Delete
</button>

              </div>
            ))}
          </div>
        )}
      </section>

    </main>
  )
}

export default Users