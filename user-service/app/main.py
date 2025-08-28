from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.models import User
import mysql.connector
import os

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB connection
def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "micro_user"),
        password=os.getenv("DB_PASSWORD", "secret"),
        database=os.getenv("DB_NAME", "micro_db")
    )

@app.post("/register")
def register(user: User):
    db = get_db_connection()
    cursor = db.cursor()
    # Check if username exists
    cursor.execute("SELECT id FROM users WHERE username=%s", (user.username,))
    if cursor.fetchone():
        raise HTTPException(status_code=400, detail="USERNAME already exists!!")
    # Insert new user
    cursor.execute(
        "INSERT INTO users (username, password) VALUES (%s, %s)",
        (user.username, user.password)
    )
    db.commit()
    user_id = cursor.lastrowid
    cursor.close()
    db.close()
    return {"message": "User registered", "user_id": user_id}

@app.post("/login")
def login(user: User):
    db = get_db_connection()
    cursor = db.cursor()
    cursor.execute(
        "SELECT id FROM users WHERE username=%s AND password=%s",
        (user.username, user.password)
    )
    row = cursor.fetchone()
    cursor.close()
    db.close()
    if row:
        return {"message": "Login successful!!", "user_id": row[0]}
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.get("/users")
def list_users():
    db = get_db_connection()
    cursor = db.cursor()
    cursor.execute("SELECT id, username FROM users")
    users_list = [{"id": u[0], "username": u[1]} for u in cursor.fetchall()]
    cursor.close()
    db.close()
    return users_list
# At the very bottom of main.py
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=5000, reload=True)

