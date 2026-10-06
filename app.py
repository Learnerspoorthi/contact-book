import json
import os
from flask import Flask, jsonify, request, render_template

app = Flask(__name__)
DATA_FILE = "contacts.json"


def load_contacts():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, "r") as f:
        return json.load(f)


def save_contacts(contacts):
    with open(DATA_FILE, "w") as f:
        json.dump(contacts, f, indent=2)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/contacts", methods=["GET"])
def list_contacts():
    contacts = load_contacts()
    q = request.args.get("q", "").strip().lower()
    if q:
        contacts = [c for c in contacts
                    if q in c["name"].lower() or q in c["phone"]]
    return jsonify(contacts)


@app.route("/api/contacts", methods=["POST"])
def add_contact():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    phone = (data.get("phone") or "").strip()
    email = (data.get("email") or "").strip()
    if not name or not phone:
        return jsonify({"error": "Name and phone are required"}), 400

    contacts = load_contacts()
    new_id = max((c["id"] for c in contacts), default=0) + 1
    contact = {"id": new_id, "name": name, "phone": phone, "email": email}
    contacts.append(contact)
    save_contacts(contacts)
    return jsonify(contact), 201


@app.route("/api/contacts/<int:contact_id>", methods=["PUT"])
def update_contact(contact_id):
    data = request.get_json(silent=True) or {}
    contacts = load_contacts()
    for c in contacts:
        if c["id"] == contact_id:
            c["name"] = (data.get("name") or c["name"]).strip()
            c["phone"] = (data.get("phone") or c["phone"]).strip()
            c["email"] = (data.get("email") or "").strip()
            save_contacts(contacts)
            return jsonify(c)
    return jsonify({"error": "Contact not found"}), 404


@app.route("/api/contacts/<int:contact_id>", methods=["DELETE"])
def delete_contact(contact_id):
    contacts = [c for c in load_contacts() if c["id"] != contact_id]
    save_contacts(contacts)
    return "", 204


if __name__ == "__main__":
    app.run(debug=True)
