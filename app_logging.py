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
    # Get query parameters
    done_filter = request.args.get('done')
    search_title = request.args.get('title')
    limit = request.args.get('limit', type=int)  # NEW: Convert to int automatically
    sort_by = request.args.get('sort', default='created_at')  # NEW: Default sort by created_at
    order = request.args.get('order', default='desc')  # NEW: Default to descending
    
    # Start with all tasks
    filtered_tasks = tasks
    
    # Filter by 'done' status
    if done_filter is not None:
        if done_filter.lower() == 'true':
            filtered_tasks = [task for task in filtered_tasks if task['done'] == True]
            logging.info(f"Filtering tasks: done=true")
        elif done_filter.lower() == 'false':
            filtered_tasks = [task for task in filtered_tasks if task['done'] == False]
            logging.info(f"Filtering tasks: done=false")
    
    # Filter by title search
    if search_title is not None:
        search_title = search_title.lower()
        filtered_tasks = [task for task in filtered_tasks if search_title in task['title'].lower()]
        logging.info(f"Filtering tasks: title contains '{search_title}'")
    
    # NEW: Sort the results
    if sort_by in ['id', 'title', 'done', 'created_at']:  # Only allow whitelisted fields
        reverse = (order.lower() == 'desc')  # True for desc, False for asc
        filtered_tasks = sorted(filtered_tasks, key=lambda task: task.get(sort_by, ''), reverse=reverse)
        logging.info(f"Sorting tasks by {sort_by} ({order})")
    else:
        logging.warning(f"Invalid sort field: {sort_by}. Using default.")
    
    # NEW: Apply limit
    if limit is not None and limit > 0:
        filtered_tasks = filtered_tasks[:limit]
        logging.info(f"Limiting results to {limit} tasks")
    
    # NEW: Return metadata with the tasks
    response = {
        "tasks": filtered_tasks,
        "total": len(tasks),
        "filtered": len(filtered_tasks),
        "limit": limit,
        "sort": sort_by,
        "order": order
    }
    
    logging.info(f"GET /tasks returned {len(filtered_tasks)} tasks")
    return jsonify(response), 200

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