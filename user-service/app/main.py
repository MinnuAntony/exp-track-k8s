from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.models import User

app = FastAPI()

# Enable CORS for local frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

users = []
user_id_counter = 1

@app.post("/register")
def register(user: User):
    global user_id_counter
    for u in users:
        if u.username == user.username:
            raise HTTPException(status_code=400, detail="USERNAME already exists!!")
    user.id = user_id_counter
    user_id_counter += 1
    users.append(user)
    return {"message": "User registered", "user_id": user.id}

@app.post("/login")
def login(user: User):
    for u in users:
        if u.username == user.username and u.password == user.password:
            return {"message": "Login successful!!", "user_id": u.id}
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.get("/users")
def list_users():
    return [{"id": u.id, "username": u.username} for u in users]

# At the very bottom of main.py
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=5000, reload=True)

