const API = 'http://localhost:3000/api';
let allVehicles = [];

function go(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));

  document.getElementById('view-' + view).classList.add('active');

  const idx = { inventory: 0, add: 1, import: 2, history: 3 };
  document.querySelectorAll('nav button')[idx[view]].classList.add('active');

  if (view === 'inventory') loadVehicles();
  if (view === 'history')   loadHistory();
}

function toast(msg, type = 'ok') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className   = 'show ' + type;
  setTimeout(() => { el.className = ''; }, 3000);
}

function fmt(n) {
  if (!n && n !== 0) return '—';
  return '$' + Number(n).toLocaleString('es-CO');
}

async function loadVehicles() {
  try {
    const res  = await fetch(`${API}/vehicles`);
    const body = await res.json();
    allVehicles = body.data || [];
    renderTable(allVehicles);
    renderStats(allVehicles);
  } catch {
    document.getElementById('tbody').innerHTML =
      '<tr><td colspan="11" class="empty">No se pudo conectar al servidor.</td></tr>';
  }
}

function renderTable(data) {
  const tbody = document.getElementById('tbody');

  if (!data.length) {
    tbody.innerHTML = '<tr><td colspan="11" class="empty">No hay vehículos registrados.</td></tr>';
    return;
  }

  tbody.innerHTML = data.map(v => `
    <tr>
      <td><span class="plate">${v.plate}</span></td>
      <td>${v.brand}</td>
      <td>${v.color  || '—'}</td>
      <td>${v.vehicle_status || '—'}</td>
      <td>${(v.mileage || 0).toLocaleString()} km</td>
      <td>${v.seller || '—'}</td>
      <td>${fmt(v.purchase_price)}</td>
      <td>${fmt(v.sale_price)}</td>
      <td style="color:${v.profit > 0 ? '#16a34a' : '#888'}">${fmt(v.profit)}</td>
      <td>
        <span class="badge ${v.operation_status === 'Sold' ? 'badge-sold' : 'badge-available'}">
          ${v.operation_status === 'Sold' ? 'Vendido' : 'Disponible'}
        </span>
      </td>
      <td>
        <div class="actions">
          <button class="btn btn-edit btn-sm"
            onclick="openEdit(${v.id},'${v.brand}','${v.color||''}','${v.vehicle_status||'New'}',${v.mileage||0})">
            Editar
          </button>
          <button class="btn btn-delete btn-sm" onclick="deleteVehicle(${v.id},'${v.plate}')">
            Eliminar
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderStats(data) {
  const sold   = data.filter(v => v.operation_status === 'Sold');
  const profit = sold.reduce((sum, v) => sum + (parseFloat(v.profit) || 0), 0);

  document.getElementById('sTotal').textContent  = data.length;
  document.getElementById('sSold').textContent   = sold.length;
  document.getElementById('sAvail').textContent  = data.length - sold.length;
  document.getElementById('sProfit').textContent = '$' + (profit / 1000000).toFixed(1) + 'M';
}

function filterTable(q) {
  const f = q.toLowerCase();
  renderTable(allVehicles.filter(v =>
    v.plate?.toLowerCase().includes(f) ||
    v.brand?.toLowerCase().includes(f) ||
    v.color?.toLowerCase().includes(f) ||
    v.seller?.toLowerCase().includes(f)
  ));
}

async function createVehicle() {
  const plate  = document.getElementById('f_plate').value.trim();
  const brand  = document.getElementById('f_brand').value.trim();

  if (!plate || !brand) return toast('Placa y marca son obligatorios', 'err');

  try {
    const res  = await fetch(`${API}/vehicles`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plate,
        brand,
        color:          document.getElementById('f_color').value,
        vehicle_status: document.getElementById('f_status').value,
        mileage:        parseInt(document.getElementById('f_mileage').value) || 0,
      }),
    });
    const body = await res.json();

    if (body.ok) {
      toast('Vehículo registrado');
      ['f_plate','f_brand','f_color','f_mileage'].forEach(id => {
        document.getElementById(id).value = '';
      });
      go('inventory');
    } else {
      toast(body.error || 'Error', 'err');
    }
  } catch {
    toast('Error de conexión', 'err');
  }
}

function openEdit(id, brand, color, status, mileage) {
  document.getElementById('e_id').value     = id;
  document.getElementById('e_brand').value  = brand;
  document.getElementById('e_color').value  = color;
  document.getElementById('e_status').value = status;
  document.getElementById('e_mileage').value= mileage;
  document.getElementById('modal-edit').classList.add('open');
}

function closeEdit() {
  document.getElementById('modal-edit').classList.remove('open');
}

async function saveEdit() {
  const id = document.getElementById('e_id').value;
  try {
    const res  = await fetch(`${API}/vehicles/${id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        brand: document.getElementById('e_brand').value,
        color: document.getElementById('e_color').value,
        vehicle_status: document.getElementById('e_status').value,
        mileage: parseInt(document.getElementById('e_mileage').value) || 0,
      }),
    });
    const body = await res.json();

    if (body.ok) {
      toast('Vehículo actualizado');
      closeEdit();
      loadVehicles();
    } else {
      toast(body.error || 'Error', 'err');
    }
  } catch {
    toast('Error de conexión', 'err');
  }
}

async function deleteVehicle(id, plate) {
  if (!confirm(`¿Eliminar el vehículo ${plate}?`)) return;

  try {
    const res  = await fetch(`${API}/vehicles/${id}`, { method: 'DELETE' });
    const body = await res.json();

    if (body.ok) {
      toast('Vehículo eliminado');
      loadVehicles();
    } else {
      toast(body.error || 'Error', 'err');
    }
  } catch {
    toast('Error de conexión', 'err');
  }
}

function handleDrop(e) {
  e.preventDefault();
  document.getElementById('drop-zone').classList.remove('drag');
  const file = e.dataTransfer.files[0];
  if (file) uploadCSV(file);
}

async function uploadCSV(file) {
  if (!file) return;

  const zone   = document.getElementById('drop-zone');
  const result = document.getElementById('upload-result');

  zone.querySelector('h3').textContent = ' Procesando...';

  const form = new FormData();
  form.append('file', file);

  try {
    const res  = await fetch(`${API}/vehicles/import`, { method: 'POST', body: form });
    const body = await res.json();

    result.className = 'upload-result visible' + (body.ok ? '' : ' error');
    result.textContent = body.ok ? body.message : body.error;

    if (body.ok) toast(body.message);
  } catch {
    result.className   = 'upload-result visible error';
    result.textContent = 'Error de conexión con el servidor.';
  }

  zone.querySelector('h3').textContent = 'Arrastra tu archivo CSV aquí';
}

async function loadHistory() {
  const container = document.getElementById('log-list');
  container.innerHTML = '<p style="color:#aaa;font-size:13px">Cargando...</p>';

  try {
    const res  = await fetch(`${API}/history`);
    const body = await res.json();

    if (!body.ok) throw new Error(body.error);

    if (!body.data.length) {
      container.innerHTML = '<p style="color:#aaa;font-size:13px">No hay registros todavía.</p>';
      return;
    }

    container.innerHTML = body.data.map(log => {
      const date   = new Date(log.date);
      const dateStr = date.toLocaleDateString('es-CO') + ' ' +
                      date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

      let detail = '';

      if (log.action === 'EDIT' && log.detail?.before) {
        const changes = Object.keys(log.detail.after)
          .filter(k => log.detail.before[k] != log.detail.after[k])
          .map(k => `${k}: ${log.detail.before[k]} → ${log.detail.after[k]}`);
        detail = changes.join(' | ') || 'Sin cambios';

      } else if (log.action === 'IMPORT' && log.detail) {
        detail = `${log.detail.file} — ${log.detail.inserted} nuevos, ${log.detail.duplicates} duplicados`;

      } else if (log.action === 'DELETE' && log.detail) {
        detail = `${log.detail.brand} ${log.detail.color} · ${(log.detail.mileage || 0).toLocaleString()} km`;

      } else if (log.action === 'CREATE' && log.detail) {
        detail = `${log.detail.brand} · ${log.detail.color} · ${log.detail.vehicle_status}`;
      }

      return `
        <div class="log-item">
          <div class="log-body">
            <div class="log-action action-${log.action}">
              ${log.action} ${log.plate ? '· <span style="font-family:monospace">' + log.plate + '</span>' : ''}
            </div>
            ${detail ? `<div class="log-detail">${detail}</div>` : ''}
          </div>
          <div class="log-date">${dateStr}</div>
        </div>
      `;
    }).join('');
  } catch (e) {
    container.innerHTML = `<p style="color:#dc2626;font-size:13px">MongoDB no disponible: ${e.message}</p>`;
  }
}

document.getElementById('modal-edit').addEventListener('click', function (e) {
  if (e.target === this) closeEdit();
});

loadVehicles();