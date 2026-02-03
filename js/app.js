// app.js - simple client logic to fetch student data by token
(function() {
  const q = new URLSearchParams(location.search);
  const token = q.get('id');

  const loading = document.getElementById('loading');
  const errorEl = document.getElementById('error');
  const studentEl = document.getElementById('student');
  const noidEl = document.getElementById('noid');

  function show(el){ el.classList.remove('hidden'); }
  function hide(el){ el.classList.add('hidden'); }

  if(!token){
    hide(loading);
    show(noidEl);
    return;
  }

  // sanitize token (very basic)
  const safeToken = token.replace(/[^a-zA-Z0-9_-]/g, '');

  // Fetch the student's JSON file from /data/<token>.json
  fetch(`/data/${encodeURIComponent(safeToken)}.json`, {cache: "no-store"})
    .then(resp => {
      if(!resp.ok) throw new Error('Student data not found (invalid or expired token).');
      return resp.json();
    })
    .then(data => {
      hide(loading);
      renderStudent(data, safeToken);
    })
    .catch(err => {
      hide(loading);
      show(errorEl);
      errorEl.textContent = err.message;
    });

  function renderStudent(data, token){
    document.getElementById('student-name').textContent = data.name || 'Student';
    document.getElementById('student-id').textContent = token;
    const tbody = document.querySelector('#grades-table tbody');
    tbody.innerHTML = '';
    if(!data.grades || Object.keys(data.grades).length === 0){
      const r = document.createElement('tr');
      r.innerHTML = `<td colspan="2">No grades available.</td>`;
      tbody.appendChild(r);
    } else {
      Object.entries(data.grades).forEach(([subject, score]) => {
        const r = document.createElement('tr');
        r.innerHTML = `<td>${escapeHtml(subject)}</td><td>${escapeHtml(String(score))}</td>`;
        tbody.appendChild(r);
      });
    }
    show(studentEl);

    document.getElementById('print-btn').onclick = () => window.print();
  }

  // minimal HTML escaping
  function escapeHtml(s){
    return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
})();
