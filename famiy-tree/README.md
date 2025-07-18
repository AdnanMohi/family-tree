# 👪 Family Tree (Node.js + Plain JS)

A lightweight, dependency-free family tree project built with **Node.js**, **JavaScript**, and **MySQL**. This project avoids frameworks like Express.js and instead uses native Node.js modules and simple file-based routing. Ideal for understanding server-side fundamentals without external abstractions.

---

## 📦 Tech Stack

- ⚙️ **Node.js** — native `http`, `fs`, `path`, and `url` modules  
- 🗃️ **MySQL** — relational database for storing user and family data  
- 💡 **mysql2/promise** — modern MySQL client with async/await support  
- 🧪 **dotenv** — for managing environment variables securely  
- 🖥️ **Plain HTML, CSS, and JS** — served statically from `/public`  

---

## 📁 Project Structure

```
family-tree/
├── db.js               # MySQL connection and table setup
├── index.js            # Main server file using Node's http module
├── routes/
│   └── index.js        # Route handler object for different URLs
├── public/             # Static frontend assets (HTML, CSS, JS)
│   ├── index.html
│   └── styles.css
├── .env                # Environment config (not tracked in Git)
├── package.json        # Project metadata and dependencies
├── package-lock.json   # Dependency lock file
└── README.md           # Project documentation (you're here!)
```

---

## 🚀 Getting Started

### 1. Clone the repository

```
git clone https://github.com/your-username/family-tree.git
cd family-tree
```

### 2. Install dependencies

```
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root with the following content:

```
HOST=localhost
USER=your_mysql_username
PASSWORD=your_mysql_password
DATABASE=family_tree
```

### 4. Run the server

```
node index.js
```

Server will start on:  
http://localhost:3000

---

## 🔧 Features

- ✅ Simple HTTP server (no Express.js)  
- ✅ MySQL connection with auto-database/table creation (`users` table)  
- ✅ Static file serving from `/public`  
- ✅ Manual routing via `routes/index.js`  
- ✅ Secure access using path normalization (prevents directory traversal)  
- ✅ Environment variables via `.env`  

---

## 📌 Future Enhancements

- Add family member management (CRUD)  
- Build relationships (parent/child/spouse)  
- Visual tree using Canvas or SVG  
- Authentication & login  
- Export/Import tree as JSON or CSV  
- Admin dashboard  

---

## 🧑‍💻 Author

**Adnan Dar**  
[💼 LinkedIn](https://www.linkedin.com/in/adnanmohi) | [💻 GitHub](https://github.com/AdnanMohi)

---

## 📜 License

This project is licensed under the **ISC License**.  
Feel free to use, modify, and contribute!

---

## 🙋‍♂️ Contributing

Pull requests and ideas are welcome! Please create an issue first if you'd like to discuss a change.
