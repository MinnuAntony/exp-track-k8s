package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"sync"

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

func createExpense(w http.ResponseWriter, r *http.Request) {
	var exp Expense
	if err := json.NewDecoder(r.Body).Decode(&exp); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	mu.Lock()
	exp.ID = nextID
	nextID++
	expenses = append(expenses, exp)
	mu.Unlock()

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

	mu.Lock()
	defer mu.Unlock()
	var userExpenses []Expense
	for _, e := range expenses {
		if e.UserID == userID {
			userExpenses = append(userExpenses, e)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(userExpenses)
}

func getAllExpenses(w http.ResponseWriter, r *http.Request) {
	mu.Lock()
	defer mu.Unlock()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(expenses)
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
