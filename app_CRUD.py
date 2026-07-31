from flask import Flask, request, jsonify
import json   # NEW: Allows us to read/write JSON files
import os     # NEW: Allows us to check if a file exists

app = Flask(__name__)

DATA_FILE = "tasks.json"

def load_data():
    """Loads tasks and next_id from the JSON file, or returns defaults if it doesn't exist."""
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r") as file:
            return json.load(file)
    # If the file doesn't exist yet, return the starting defaults
    return {"tasks": [], "next_id": 1}

def save_data(data):
    """Saves the current tasks and next_id to the JSON file."""
    with open(DATA_FILE, "w") as file:
        # indent=4 makes the file nicely formatted and readable for humans!
        json.dump(data, file, indent=4)

# Load the data as soon as the app starts
app_data = load_data()
tasks = app_data["tasks"]
next_id = app_data["next_id"]

@app.route("/tasks", methods=["GET"])
def get_tasks():
    return jsonify(tasks), 200


@app.route("/tasks", methods=["POST"])
def create_task():
    global next_id
    data = request.get_json()
    if not data or "title" not in data:
        return jsonify({"error": "Title is required"}), 400

    task = {"id": next_id, "title": data["title"], "done": False}
    tasks.append(task)
    next_id += 1
    save_data({"tasks": tasks, "next_id": next_id})  # Save after creating a task
    return jsonify(task), 201

@app.route("/tasks/<int:task_id>", methods=["PUT"])
def update_task(task_id):
    data = request.get_json()
    
    # Loop through the tasks to find the one with the matching ID
    for task in tasks:
        if task["id"] == task_id:
            # Update the task if the user sent new data
            if "title" in data:
                task["title"] = data["title"]
            if "done" in data:
                task["done"] = data["done"]

            save_data({"tasks": tasks, "next_id": next_id})  # Save after creating a task    
            return jsonify(task), 200
            
    # If the loop finishes and we didn't find the ID, return a 404 error
    return jsonify({"error": "Task not found"}), 404

@app.route("/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    # enumerate() gives us both the index (i) and the item (task) in the list
    for i, task in enumerate(tasks):
        if task["id"] == task_id:
            # .pop(i) removes the item at that index and returns it
            removed_task = tasks.pop(i)
            save_data({"tasks": tasks, "next_id": next_id})  # Save after creating a task
            return jsonify({
                "message": "Task successfully deleted",
                "task": removed_task
            }), 200
            
    # If the loop finishes and we never found a matching ID
    return jsonify({"error": "Task not found"}), 404    

@app.route("/tasks/<int:task_id>", methods=["GET"])
def get_single_task(task_id):
    # Loop through our tasks to find a match
    for task in tasks:
        if task["id"] == task_id:
            return jsonify(task), 200
            
    # If the loop finishes and we didn't find it
    return jsonify({"error": "Task not found"}), 404

if __name__ == "__main__":
    app.run(debug=True)


#PUT Invoke-RestMethod -Uri "http://127.0.0.1:5000/tasks/1" -Method PUT -Body '{"done": true}' -ContentType "application/json"
#PUT Invoke-RestMethod -Uri "http://127.0.0.1:5000/tasks/2" -Method PUT -Body (@{done=$true} | ConvertTo-Json) -ContentType "application/json"
#GET Invoke-RestMethod -Uri "http://127.0.0.1:5000/tasks" -Method GET
#POST Invoke-RestMethod -Uri http://127.0.0.1:5000/tasks -Method POST -Body '{"title": "Buy groceries"}' -ContentType "application/json"
#CURL curl.exe -X PUT "http://127.0.0.1:5000/tasks/1" -H "Content-Type: application/json" -d '{"done": true}'