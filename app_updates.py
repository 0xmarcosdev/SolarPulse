from flask import Flask, request, jsonify

app = Flask(__name__)

tasks = []
next_id = 1


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
                
            return jsonify(task), 200
            
    # If the loop finishes and we didn't find the ID, return a 404 error
    return jsonify({"error": "Task not found"}), 404

if __name__ == "__main__":
    app.run(debug=True)
#cambios