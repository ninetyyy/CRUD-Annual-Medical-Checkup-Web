const ranges = {
    sugar: { min: 70, max: 99 },
    bun: { min: 8.9, max: 20.6 },
    creatinine: {
        Male: { min: 0.73, max: 1.18 },
        Female: { min: 0.5, max: 1.1 },
        Other: { min: 0.5, max: 1.18 }
    },
    egrf: { min: 90, max: 120 }, // eGFR >= 90 is normal
    cholesterol: { min: 0, max: 199.99 }, // < 200 is normal
    triglycerides: { min: 0, max: 149.99 }, // < 150 is normal
    hdl_c: {
        Male: { min: 40, max: 9999 },
        Female: { min: 50, max: 9999 },
        Other: { min: 40, max: 9999 }
    },
    ldl_c: { min: 0, max: 129.99 }, // < 130 is normal
    uric_acid: {
        Male: { min: 3.5, max: 7.2 },
        Female: { min: 2.4, max: 6.0 },
        Other: { min: 2.4, max: 7.2 }
    },
    total_protein: { min: 6.0, max: 8.3 },
    albumin: { min: 3.5, max: 5.0 },
    alk_phos: { min: 40, max: 150 },
    sgot: { min: 5, max: 34 },
    sgpt: {
        Male: { min: 0, max: 45 },
        Female: { min: 10, max: 35 },
        Other: { min: 10, max: 50 }
    },
    wbc: { min: 4.0, max: 10.0 },
    rbc_m: {
        Male: { min: 4.5, max: 5.9 },
        Female: { min: 4.0, max: 5.2 },
        Other: { min: 4.0, max: 5.9 }
    },
    hgb_m: {
        Male: { min: 13, max: 18 },
        Female: { min: 12.0, max: 15.5 },
        Other: { min: 12.0, max: 17.5 }
    },
    hct_m: {
        Male: { min: 40, max: 54 },
        Female: { min: 35, max: 45 },
        Other: { min: 35, max: 49 }
    },
    platelets: { min: 150, max: 450 },
    neu: { min: 46.5, max: 75.0 },
    lymp: { min: 12, max: 44 },
    mono: { min: 0.0, max: 11.2 },
    eos: { min: 1, max: 6 },
    baso: { min: 0, max: 2 },
    specific_gravity: { min: 1.003, max: 1.030 },
    ph: { min: 4.5, max: 8.0 }
};

function calculateBMI(weight, height) {
    if (!weight || !height) return null;
    const hMeter = height / 100;
    return (weight / (hMeter * hMeter)).toFixed(1);
}

function formatBMI(bmi) {
    if (!bmi) return '-';
    const val = parseFloat(bmi);
    if (val < 18.5) {
        return `<span class="badge badge-low" title="Underweight (< 18.5)">${val}</span>`;
    } else if (val >= 25.0) {
        return `<span class="badge badge-high" title="Obese (>= 25.0)">${val}</span>`;
    } else if (val >= 23.0) {
        return `<span class="badge badge-warning" title="Overweight (23.0 - 24.9)">${val}</span>`;
    } else {
        return `<span class="badge badge-normal" title="Normal (18.5 - 22.9)">${val}</span>`;
    }
}

function getClinicalBadge(value, rangeKey, gender) {
    if (value === null || value === undefined || value === '') return '-';

    if (rangeKey === 'hbs_ag' || rangeKey === 'urine_exam' || rangeKey === 'chest_x_ray') {
        const strVal = String(value).trim().toLowerCase();
        const isNormal = strVal === 'normal' || strVal === 'negative' || strVal === 'neg' || strVal === 'normal chest';
        if (isNormal) {
            return `<span class="badge badge-normal">${value}</span>`;
        } else {
            return `<span class="badge badge-high" title="Abnormal/Positive">${value}</span>`;
        }
    }

    const num = parseFloat(value);
    if (isNaN(num)) return value;

    let rule = ranges[rangeKey];
    if (!rule) return num;

    if (rule.Male || rule.Female) {
        rule = rule[gender] || rule.Other || rule.Male;
    }

    const { min, max } = rule;
    const label = `${min} - ${max}`;

    if (num < min) {
        return `<span class="badge badge-low" title="Low (Normal: ${label})">${num}</span>`;
    } else if (num > max) {
        return `<span class="badge badge-high" title="High (Normal: ${label})">${num}</span>`;
    } else {
        return `<span class="badge badge-normal" title="Normal: ${label}">${num}</span>`;
    }
}

const form = document.getElementById('checkupForm');
const tableHeader = document.querySelector('#checkupTable thead');
const tableBody = document.querySelector('#checkupTable tbody');
const mobileCards = document.getElementById('mobileCards');

// Medical metrics configuration for vertical table layout
const metrics = [
    { label: 'Year', key: 'year' },
    { label: 'Gender', key: 'gender' },
    { label: 'Weight', key: 'weight', unit: ' kg' },
    { label: 'Height', key: 'height', unit: ' cm' },
    { label: 'Computed BMI', formatter: row => formatBMI(calculateBMI(row.weight, row.height)) },

    { category: 'Blood Chemistry & Kidney Function' },
    { label: 'Sugar (FPG)', key: 'sugar', unit: ' mg/dL' },
    { label: 'BUN', key: 'bun', unit: ' mg/dL' },
    { label: 'Creatinine', key: 'creatinine', unit: ' mg/dL' },
    { label: 'eGFR', key: 'egrf' },
    { label: 'Uric Acid', key: 'uric_acid', unit: ' mg/dL' },

    { category: 'Lipid Profile' },
    { label: 'Cholesterol', key: 'cholesterol', unit: ' mg/dL' },
    { label: 'Triglycerides', key: 'triglycerides', unit: ' mg/dL' },
    { label: 'HDL-C', key: 'hdl_c', unit: ' mg/dL' },
    { label: 'LDL-C', key: 'ldl_c', unit: ' mg/dL' },

    { category: 'Liver Function & Proteins' },
    { label: 'Total Protein', key: 'total_protein', unit: ' g/dL' },
    { label: 'Albumin', key: 'albumin', unit: ' g/dL' },
    { label: 'Alk Phos (ALP)', key: 'alk_phos', unit: ' U/L' },
    { label: 'SGOT (AST)', key: 'sgot', unit: ' U/L' },
    { label: 'SGPT (ALT)', key: 'sgpt', unit: ' U/L' },
    { label: 'HBs Ag', key: 'hbs_ag' },

    { category: 'Hematology (CBC)' },
    { label: 'WBC', key: 'wbc', unit: ' x10³/µL' },
    { label: 'RBC', key: 'rbc_m', unit: ' x10⁶/µL' },
    { label: 'Hemoglobin (HGB)', key: 'hgb_m', unit: ' g/dL' },
    { label: 'Hematocrit (HCT)', key: 'hct_m', unit: '%' },
    { label: 'Platelets', key: 'platelets', unit: ' x10³/µL' },
    { label: 'NEU', key: 'neu', unit: '%' },
    { label: 'LYMP', key: 'lymp', unit: '%' },
    { label: 'MONO', key: 'mono', unit: '%' },
    { label: 'EOS', key: 'eos', unit: '%' },
    { label: 'BASO', key: 'baso', unit: '%' },

    { category: 'Urine & Imaging' },
    { label: 'Specific Gravity', key: 'specific_gravity' },
    { label: 'pH', key: 'ph' },
    { label: 'Urine Exam', key: 'urine_exam' },
    { label: 'Chest X-Ray', key: 'chest_x_ray' },

    { category: 'Actions' },
    { label: 'Action', formatter: row => `<button class="btn-edit" onclick="editCheckup(${row.id})">Edit</button> <button class="btn-delete" onclick="deleteCheckup(${row.id})">Delete</button>` }
];

async function deleteCheckup(id) {
    if (confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
        try {
            const response = await fetch(`/api/checkups/${id}`, { method: 'DELETE' });
            if (response.ok) {
                fetchCheckups();
            } else {
                const errData = await response.json();
                alert('Error deleting record: ' + (errData.error || 'Unknown error'));
            }
        } catch (err) {
            console.error('Error deleting record:', err);
            alert('Connection error');
        }
    }
}

let allCheckups = [];
let editingRecordId = null;

// Edit modal functions
function openEditModal(record) {
    editingRecordId = record.id;
    const fields = [
        'year', 'first_name', 'last_name', 'gender', 'weight', 'height',
        'sugar', 'bun', 'creatinine', 'egrf', 'cholesterol', 'triglycerides',
        'uric_acid', 'total_protein', 'albumin', 'hdl_c', 'ldl_c', 'alk_phos',
        'sgot', 'sgpt', 'hbs_ag', 'wbc', 'rbc_m', 'hgb_m', 'hct_m', 'platelets',
        'neu', 'lymp', 'mono', 'eos', 'baso', 'specific_gravity', 'ph',
        'urine_exam', 'chest_x_ray'
    ];

    fields.forEach(field => {
        const editField = document.getElementById(`edit_${field}`);
        if (editField && record[field] !== null && record[field] !== undefined) {
            editField.value = record[field];
        } else if (editField) {
            editField.value = '';
        }
    });

    document.getElementById('editModal').style.display = 'flex';
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    document.getElementById('editForm').reset();
    editingRecordId = null;
}

async function editCheckup(id) {
    const record = allCheckups.find(r => String(r.id) === String(id));
    if (record) {
        openEditModal(record);
    }
}

async function updateCheckup(id, formData) {
    try {
        const response = await fetch(`/api/checkups/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            closeEditModal();
            fetchCheckups();
        } else {
            const errData = await response.json();
            alert('Error updating record: ' + (errData.error || 'Unknown error'));
        }
    } catch (err) {
        console.error('Error updating record:', err);
        alert('Connection error');
    }
}

// Event listeners for edit modal
document.getElementById('closeModal').addEventListener('click', closeEditModal);
document.getElementById('cancelEditBtn').addEventListener('click', closeEditModal);

window.addEventListener('click', (e) => {
    const modal = document.getElementById('editModal');
    if (e.target === modal) {
        closeEditModal();
    }
});

async function fetchCheckups() {
    try {
        const response = await fetch('/api/checkups');
        const data = await response.json();
        allCheckups = data;
        filterAndRender();
    } catch (err) {
        console.error('Error fetching data:', err);
    }
}

function filterAndRender() {
    const nameFilter = document.getElementById('nameFilter');
    const yearFilter = document.getElementById('yearFilter');
    const nameQuery = nameFilter ? nameFilter.value.trim().toLowerCase() : '';
    const yearQuery = yearFilter ? yearFilter.value.trim() : '';

    const filtered = allCheckups.filter(row => {
        const firstName = (row.first_name || '').toLowerCase();
        const lastName = (row.last_name || '').toLowerCase();
        const nameMatch = firstName.includes(nameQuery) || lastName.includes(nameQuery);
        const yearMatch = !yearQuery || String(row.year) === yearQuery;
        return nameMatch && yearMatch;
    });

    renderRecords(filtered);
}

function renderRecords(data) {
    // Reset containers
    tableHeader.innerHTML = '';
    tableBody.innerHTML = '';
    mobileCards.innerHTML = '';

    if (data.length === 0) {
        tableHeader.innerHTML = '<tr><th>No matching records found</th></tr>';
        tableBody.innerHTML = '<tr><td>No checkups match your filter criteria.</td></tr>';
        return;
    }

    // 1. Build Transposed Table Header
    let headerHtml = '<tr><th>Metric / Parameter</th>';
    data.forEach(row => {
        headerHtml += `<th>${row.first_name} ${row.last_name}<br><small>${row.year} (${row.gender})</small></th>`;
    });
    headerHtml += '</tr>';
    tableHeader.innerHTML = headerHtml;

    // 2. Build Transposed Table Rows
    metrics.forEach(metric => {
        if (metric.category) {
            const categoryRow = document.createElement('tr');
            categoryRow.className = 'category-row';
            categoryRow.innerHTML = `<th colspan="${data.length + 1}">${metric.category}</th>`;
            tableBody.appendChild(categoryRow);
        } else {
            const tr = document.createElement('tr');
            let rowHtml = `<td><strong>${metric.label}</strong></td>`;
            data.forEach(row => {
                const gender = row.gender || 'Male';
                let val = '-';
                if (metric.formatter) {
                    val = metric.formatter(row);
                } else if (metric.key) {
                    const rawVal = row[metric.key];
                    if (rawVal !== null && rawVal !== undefined && rawVal !== '') {
                        val = getClinicalBadge(rawVal, metric.key, gender);
                        if (metric.unit && val !== '-') {
                            val += metric.unit;
                        }
                    }
                }
                rowHtml += `<td>${val}</td>`;
            });
            tr.innerHTML = rowHtml;
            tableBody.appendChild(tr);
        }
    });

    // 3. Build Mobile Cards (remains clean and vertical as before)
    data.forEach(row => {
        const gender = row.gender || 'Male';
        const bmi = calculateBMI(row.weight, row.height);
        const bmiBadge = formatBMI(bmi);

        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-header">
                <div class="card-title">
                    <span>${row.first_name} ${row.last_name}</span>
                    <span class="card-subtitle">Year: ${row.year} | ${row.gender}</span>
                </div>
                <button class="btn-edit" onclick="editCheckup(${row.id})">Edit</button>
                <button class="btn-delete" onclick="deleteCheckup(${row.id})">Delete</button>
            </div>
            <div class="card-grid">
                <div class="card-row"><strong>Weight/Height:</strong> <span>${row.weight || '-'}/${row.height || '-'}</span></div>
                <div class="card-row"><strong>Computed BMI:</strong> <span>${bmiBadge}</span></div>
                <div class="card-row"><strong>Sugar (FPG):</strong> <span>${getClinicalBadge(row.sugar, 'sugar', gender)} mg/dL</span></div>
                <div class="card-row"><strong>BUN:</strong> <span>${getClinicalBadge(row.bun, 'bun', gender)} mg/dL</span></div>
                <div class="card-row"><strong>Creatinine:</strong> <span>${getClinicalBadge(row.creatinine, 'creatinine', gender)} mg/dL</span></div>
                <div class="card-row"><strong>eGFR:</strong> <span>${getClinicalBadge(row.egrf, 'egrf', gender)}</span></div>
                <div class="card-row"><strong>Total Cholesterol:</strong> <span>${getClinicalBadge(row.cholesterol, 'cholesterol', gender)} mg/dL</span></div>
                <div class="card-row"><strong>Triglycerides:</strong> <span>${getClinicalBadge(row.triglycerides, 'triglycerides', gender)} mg/dL</span></div>
                <div class="card-row"><strong>HDL-C:</strong> <span>${getClinicalBadge(row.hdl_c, 'hdl_c', gender)} mg/dL</span></div>
                <div class="card-row"><strong>LDL-C:</strong> <span>${getClinicalBadge(row.ldl_c, 'ldl_c', gender)} mg/dL</span></div>
                <div class="card-row"><strong>Uric Acid:</strong> <span>${getClinicalBadge(row.uric_acid, 'uric_acid', gender)} mg/dL</span></div>
                <div class="card-row"><strong>SGOT (AST):</strong> <span>${getClinicalBadge(row.sgot, 'sgot', gender)} U/L</span></div>
                <div class="card-row"><strong>SGPT (ALT):</strong> <span>${getClinicalBadge(row.sgpt, 'sgpt', gender)} U/L</span></div>
                <div class="card-row"><strong>Alk Phos (ALP):</strong> <span>${getClinicalBadge(row.alk_phos, 'alk_phos', gender)} U/L</span></div>
                <div class="card-row"><strong>HBs Ag:</strong> <span>${getClinicalBadge(row.hbs_ag, 'hbs_ag', gender)}</span></div>
                <div class="card-row"><strong>WBC:</strong> <span>${getClinicalBadge(row.wbc, 'wbc', gender)} x10³/µL</span></div>
                <div class="card-row"><strong>RBC:</strong> <span>${getClinicalBadge(row.rbc_m, 'rbc_m', gender)} x10⁶/µL</span></div>
                <div class="card-row"><strong>Hemoglobin:</strong> <span>${getClinicalBadge(row.hgb_m, 'hgb_m', gender)} g/dL</span></div>
                <div class="card-row"><strong>Hematocrit:</strong> <span>${getClinicalBadge(row.hct_m, 'hct_m', gender)}%</span></div>
                <div class="card-row"><strong>Platelets:</strong> <span>${getClinicalBadge(row.platelets, 'platelets', gender)} x10³/µL</span></div>
                <div class="card-row"><strong>Diff (N/L/M/E/B):</strong> 
                    <span>
                        ${getClinicalBadge(row.neu, 'neu', gender)}/
                        ${getClinicalBadge(row.lymp, 'lymp', gender)}/
                        ${getClinicalBadge(row.mono, 'mono', gender)}/
                        ${getClinicalBadge(row.eos, 'eos', gender)}/
                        ${getClinicalBadge(row.baso, 'baso', gender)}
                    </span>
                </div>
                <div class="card-row"><strong>Urine SpGr/pH:</strong> 
                    <span>
                        ${getClinicalBadge(row.specific_gravity, 'specific_gravity', gender)}/
                        ${getClinicalBadge(row.ph, 'ph', gender)}
                    </span>
                </div>
                <div class="card-row"><strong>Urine Exam:</strong> <span>${getClinicalBadge(row.urine_exam, 'urine_exam', gender)}</span></div>
                <div class="card-row"><strong>Chest X-Ray:</strong> <span>${getClinicalBadge(row.chest_x_ray, 'chest_x_ray', gender)}</span></div>
            </div>
        `;
        mobileCards.appendChild(card);
    });
}

// Edit form submit handler
const editForm = document.getElementById('editForm');
editForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fields = [
        'year', 'first_name', 'last_name', 'gender', 'weight', 'height',
        'sugar', 'bun', 'creatinine', 'egrf', 'cholesterol', 'triglycerides',
        'uric_acid', 'total_protein', 'albumin', 'hdl_c', 'ldl_c', 'alk_phos',
        'sgot', 'sgpt', 'hbs_ag', 'wbc', 'rbc_m', 'hgb_m', 'hct_m', 'platelets',
        'neu', 'lymp', 'mono', 'eos', 'baso', 'specific_gravity', 'ph',
        'urine_exam', 'chest_x_ray'
    ];

    const formData = {};
    fields.forEach(field => {
        const element = document.getElementById(`edit_${field}`);
        if (element) {
            let value = element.value;
            if (element.type === 'number' && value !== '') {
                value = parseFloat(value);
            }
            formData[field] = value === '' ? null : value;
        }
    });

    try {
        const response = await fetch(`/api/checkups/${editingRecordId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            closeEditModal();
            fetchCheckups();
        } else {
            const errData = await response.json();
            alert('Error updating record: ' + (errData.error || 'Unknown error'));
        }
    } catch (err) {
        console.error('Error updating record:', err);
        alert('Connection error');
    }
});

// Event Listeners for BMI dynamic changes in form
const weightInput = document.getElementById('weight');
const heightInput = document.getElementById('height');
const bmiDisplay = document.getElementById('bmiDisplay');

function updateFormBMI() {
    const w = parseFloat(weightInput.value);
    const h = parseFloat(heightInput.value);
    if (w && h) {
        const bmi = calculateBMI(w, h);
        bmiDisplay.innerHTML = `Calculated BMI: ${formatBMI(bmi)}`;
    } else {
        bmiDisplay.innerHTML = '';
    }
}

weightInput.addEventListener('input', updateFormBMI);
heightInput.addEventListener('input', updateFormBMI);

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fields = [
        'year', 'first_name', 'last_name', 'gender', 'weight', 'height',
        'sugar', 'bun', 'creatinine', 'egrf', 'cholesterol', 'triglycerides',
        'uric_acid', 'total_protein', 'albumin', 'hdl_c', 'ldl_c', 'alk_phos',
        'sgot', 'sgpt', 'hbs_ag', 'wbc', 'rbc_m', 'hgb_m', 'hct_m', 'platelets',
        'neu', 'lymp', 'mono', 'eos', 'baso', 'specific_gravity', 'ph',
        'urine_exam', 'chest_x_ray'
    ];

    const formData = {};
    fields.forEach(field => {
        const element = document.getElementById(field);
        if (element) {
            let value = element.value;
            if (element.type === 'number' && value !== '') {
                value = parseFloat(value);
            }
            formData[field] = value === '' ? null : value;
        }
    });

    try {
        const response = await fetch('/api/checkups', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            alert('Data saved successfully!');
            form.reset();
            bmiDisplay.innerHTML = '';
            fetchCheckups();
        } else {
            const errData = await response.json();
            alert('Error saving data: ' + (errData.error || 'Unknown error'));
        }
    } catch (err) {
        console.error('Error submitting form:', err);
        alert('Connection error');
    }
});

// Theme Toggle Logic
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const themeText = document.getElementById('themeText');
const html = document.documentElement;

function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
        themeIcon.textContent = '☀️';
        themeText.textContent = 'Light Mode';
    } else {
        themeIcon.textContent = '🌙';
        themeText.textContent = 'Dark Mode';
    }
}

// Initialize theme
const savedTheme = localStorage.getItem('theme') || 'light';
setTheme(savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
});

const nameFilter = document.getElementById('nameFilter');
if (nameFilter) {
    nameFilter.addEventListener('input', filterAndRender);
}

const yearFilter = document.getElementById('yearFilter');
if (yearFilter) {
    yearFilter.addEventListener('input', filterAndRender);
}

// Initial Fetch
fetchCheckups();
