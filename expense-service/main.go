package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"sync"
        "database/sql"
        "os"
        
        _ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

type Expense struct {
	ID       int     `json:"id"`
	UserID   int     `json:"user_id"`
	Category string  `json:"category"`
	Amount   float64 `json:"amount"`
}

var (
	// The fix: Initialize expenses as an empty slice, not nil
	expenses = []Expense{} 
	mu       sync.Mutex
	nextID   = 1
)

func getDB() (*sql.DB, error) {
    dsn := fmt.Sprintf("%s:%s@tcp(%s:3306)/%s",
        os.Getenv("DB_USER"),
        os.Getenv("DB_PASSWORD"),
        os.Getenv("DB_HOST"),
        os.Getenv("DB_NAME"),
    )
    return sql.Open("mysql", dsn)
}


func createExpense(w http.ResponseWriter, r *http.Request) {
    var exp Expense
    if err := json.NewDecoder(r.Body).Decode(&exp); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    db, err := getDB()
    if err != nil {
        http.Error(w, "DB connection error", http.StatusInternalServerError)
        return
    }
    defer db.Close()

    result, err := db.Exec(
        "INSERT INTO expenses (user_id, category, amount) VALUES (?, ?, ?)",
        exp.UserID, exp.Category, exp.Amount,
    )
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    id, _ := result.LastInsertId()
    exp.ID = int(id)

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(exp)
}


func getExpensesByUser(w http.ResponseWriter, r *http.Request) {
    params := mux.Vars(r)
    userID, err := strconv.Atoi(params["userId"])
    if err != nil {
        http.Error(w, "Invalid user ID", http.StatusBadRequest)
        return
    }

    db, err := getDB()
    if err != nil {
        http.Error(w, "DB connection error", http.StatusInternalServerError)
        return
    }
    defer db.Close()

    rows, err := db.Query("SELECT id, user_id, category, amount FROM expenses WHERE user_id=?", userID)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    defer rows.Close()

    var userExpenses []Expense
    for rows.Next() {
        var e Expense
        rows.Scan(&e.ID, &e.UserID, &e.Category, &e.Amount)
        userExpenses = append(userExpenses, e)
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(userExpenses)
}

func getAllExpenses(w http.ResponseWriter, r *http.Request) {
    db, err := getDB()
    if err != nil {
        http.Error(w, "DB connection error", http.StatusInternalServerError)
        return
    }
    defer db.Close()

    rows, err := db.Query("SELECT id, user_id, category, amount FROM expenses")
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    defer rows.Close()

    var allExpenses []Expense
    for rows.Next() {
        var e Expense
        rows.Scan(&e.ID, &e.UserID, &e.Category, &e.Amount)
        allExpenses = append(allExpenses, e)
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(allExpenses)
}

func main() {
	r := mux.NewRouter()
	r.HandleFunc("/expenses", getAllExpenses).Methods("GET")
	r.HandleFunc("/expenses", createExpense).Methods("POST")
	r.HandleFunc("/expenses/{userId}", getExpensesByUser).Methods("GET")

	c := cors.New(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders: []string{"Content-Type"},
		Debug:          true,
	})

	handler := c.Handler(r)

	fmt.Println("Server is running on port 8080...")
	http.ListenAndServe(":8080", handler)
}
