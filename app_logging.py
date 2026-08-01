from flask import Flask, request, jsonify
import json
import os
import logging          # NEW: For professional console logging
from datetime import datetime # NEW: For generating timestamps

app = Flask(__name__)

# NEW: Configure logging to show INFO level messages and above
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

DATA_FILE = "tasks.json"

def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r") as file:
            return json.load(file)
    logging.info("No existing tasks.json found. Starting with empty list.") # NEW
    return {"tasks": [], "next_id": 1}

def save_data(data):
    with open(DATA_FILE, "w") as file:
        json.dump(data, file, indent=4)
    logging.info("Data successfully saved to tasks.json") # NEW

app_data = load_data()
tasks = app_data["tasks"]
next_id = app_data["next_id"]


@app.route("/tasks", methods=["GET"])
def get_tasks():
    logging.info(f"GET /tasks requested. Returning {len(tasks)} tasks.") # NEW
    return jsonify(tasks), 200


@app.route("/tasks", methods=["POST"])
def create_task():
    global next_id
    data = request.get_json()
    if not data or "title" not in data:
        logging.warning("POST /tasks failed: Title is required") # NEW
        return jsonify({"error": "Title is required"}), 400

    # NEW: Add a timestamp in ISO 8601 format (e.g., "2026-08-01T14:30:00")
    task = {
        "id": next_id, 
        "title": data["title"], 
        "done": False,
        "created_at": datetime.now().isoformat()
    }
    tasks.append(task)
    next_id += 1
    
    save_data({"tasks": tasks, "next_id": next_id})
    logging.info(f"POST /tasks successful: Created task ID {task['id']}") # NEW
    
    return jsonify(task), 201


@app.route("/tasks/<int:task_id>", methods=["GET"])
def get_single_task(task_id):
    for task in tasks:
        if task["id"] == task_id:
            logging.info(f"GET /tasks/{task_id} successful.") # NEW
            return jsonify(task), 200
            
    logging.warning(f"GET /tasks/{task_id} failed: Task not found") # NEW
    return jsonify({"error": "Task not found"}), 404


@app.route("/tasks/<int:task_id>", methods=["PUT"])
def update_task(task_id):
    data = request.get_json()
    for task in tasks:
        if task["id"] == task_id:
            if "title" in data:
                task["title"] = data["title"]
            if "done" in data:
                task["done"] = data["done"]
            
            save_data({"tasks": tasks, "next_id": next_id})
            logging.info(f"PUT /tasks/{task_id} successful: Task updated.") # NEW
            return jsonify(task), 200
            
    logging.warning(f"PUT /tasks/{task_id} failed: Task not found") # NEW
    return jsonify({"error": "Task not found"}), 404


@app.route("/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    for i, task in enumerate(tasks):
        if task["id"] == task_id:
            removed_task = tasks.pop(i)
            save_data({"tasks": tasks, "next_id": next_id})
            logging.info(f"DELETE /tasks/{task_id} successful: Task removed.") # NEW
            return jsonify({"message": "Task successfully deleted", "task": removed_task}), 200
            
    logging.warning(f"DELETE /tasks/{task_id} failed: Task not found") # NEW
    return jsonify({"error": "Task not found"}), 404


if __name__ == "__main__":
    logging.info("Starting Flask Application...") # NEW
    app.run(debug=True)