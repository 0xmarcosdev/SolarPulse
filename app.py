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


if __name__ == "__main__":
    app.run(debug=True)
