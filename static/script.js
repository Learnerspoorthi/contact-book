const form = document.getElementById('form');
const nameInput = document.getElementById('name');
const phoneInput = document.getElementById('phone');
const emailInput = document.getElementById('email');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');
const search = document.getElementById('search');
const list = document.getElementById('list');

let editingId = null;

async function loadContacts() {
  const res = await fetch('/api/contacts?q=' + encodeURIComponent(search.value));
  render(await res.json());
}

function render(contacts) {
  list.innerHTML = '';
  if (!contacts.length) {
    list.innerHTML = '<div class="empty">No contacts found.</div>';
    return;
  }
  contacts.forEach(c => {
    const li = document.createElement('li');

    const info = document.createElement('div');
    info.className = 'info';
    const name = document.createElement('strong');
    name.textContent = c.name;
    const phone = document.createElement('small');
    phone.textContent = c.phone;
    info.append(name, phone);
    if (c.email) {
      const email = document.createElement('small');
      email.textContent = c.email;
      info.append(email);
    }

    const actions = document.createElement('div');
    actions.className = 'actions';
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => startEdit(c));
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.className = 'danger';
    delBtn.addEventListener('click', () => removeContact(c.id));
    actions.append(editBtn, delBtn);

    li.append(info, actions);
    list.appendChild(li);
  });
}

function startEdit(c) {
  editingId = c.id;
  nameInput.value = c.name;
  phoneInput.value = c.phone;
  emailInput.value = c.email;
  saveBtn.textContent = 'Save changes';
  cancelBtn.hidden = false;
  nameInput.focus();
}

function resetForm() {
  editingId = null;
  form.reset();
  saveBtn.textContent = 'Add contact';
  cancelBtn.hidden = true;
}

async function removeContact(id) {
  if (!confirm('Delete this contact?')) return;
  await fetch('/api/contacts/' + id, { method: 'DELETE' });
  loadContacts();
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  const body = JSON.stringify({
    name: nameInput.value,
    phone: phoneInput.value,
    email: emailInput.value
  });
  const url = editingId ? '/api/contacts/' + editingId : '/api/contacts';
  const method = editingId ? 'PUT' : 'POST';
  await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body });
  resetForm();
  loadContacts();
});

cancelBtn.addEventListener('click', resetForm);
search.addEventListener('input', loadContacts);

loadContacts();
